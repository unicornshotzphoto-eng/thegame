from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response 
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, QuestionCategorySerializer, GameSessionSerializer, GameSessionListSerializer, PlayerAnswerSerializer, DirectMessageSerializer, FriendshipSerializer
from .models import User, GameSession, PlayerAnswer, Question, QuestionCategory, JournalPrompt, Friendship, DirectMessage, PromptResponse, SharedPromptSession
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from difflib import SequenceMatcher
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import re

# Create your views here.

def normalize_answer(text: str) -> str:
    """Normalize an answer string: lowercase, strip, collapse whitespace, remove punctuation."""
    if not text:
        return ''
    s = str(text).lower().strip()
    # Replace punctuation (anything not word or whitespace) with space, collapse multiple spaces
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s

def similarity_ratio(a: str, b: str) -> float:
    """Compute similarity ratio between two normalized strings."""
    return SequenceMatcher(None, a, b).ratio()

def award_points(submitted: str, canonical: str, max_points: int) -> int:
    """Award points based on fuzzy similarity to canonical answer.
    - Full points for strong match (>= 0.85)
    - Partial points (rounded) for decent match (>= 0.6)
    - Otherwise 0
    """
    if not submitted or not canonical:
        return 0
    try:
        ratio = similarity_ratio(submitted, canonical)
    except Exception:
        return 0
    if ratio >= 0.85:
        return int(max_points)
    if ratio >= 0.6:
        return int(round(max_points * ratio))
    return 0

def broadcast_game_update(game_id, data: dict):
    """Broadcast a game update to all websocket clients in the game group."""
    try:
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            f"game_{game_id}",
            {"type": "game_update", "data": data}
        )
    except Exception:
        # Non-fatal: websocket broadcasting should not break HTTP flow
        pass

def get_auth_user(user):
    tokens = RefreshToken.for_user(user)
    print('token', tokens)
    return {
        'user': UserSerializer(user).data,
        'access': str(tokens.access_token),
        'refresh': str(tokens)
    }
    # if request.user.is_authenticated:
    #     user_data = {
    #         'id': request.user.id,
    #         'username': request.user.username,
    #         'email': request.user.email,
    #     }
    #     return Response(user_data)
    # else:
    #     return Response(status=401) 
    
class SigninView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Implement sign-in logic here
        username = request.data.get('username')
        password = request.data.get('password')
        print(f'Signin attempt - username: {username}')
        
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        
        user = authenticate(request, username=username, password=password)
        print(f'Authentication result: {user}')
        
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=401)
        
        try:
            user_data = get_auth_user(user)
            print(f'User data: {user_data}')
            return Response(user_data)
        except Exception as e:
            print(f'Error in get_auth_user: {e}')
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class SignupView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response({'error': 'Username, email, and password are required'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user_data = get_auth_user(user)
        return Response(user_data, status=201)

class UpdateProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        user = request.user
        
        if 'thumbnail' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=400)
        
        # Delete old thumbnail if exists
        if user.thumbnail:
            user.thumbnail.delete()
        
        user.thumbnail = request.FILES['thumbnail']
        user.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Profile picture updated successfully'
        }, status=200)

class SearchUsersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({'users': []}, status=200)
        
        # Search by username or email (case-insensitive)
        users = User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        ).exclude(id=request.user.id)[:20]  # Exclude current user, limit to 20 results
        
        serializer = UserSerializer(users, many=True)
        return Response({'users': serializer.data}, status=200)

class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        to_user_id = request.data.get('to_user_id')
        
        if not to_user_id:
            return Response({'error': 'to_user_id is required'}, status=400)
        
        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        if to_user == request.user:
            return Response({'error': 'Cannot send friend request to yourself'}, status=400)
        
        # Check if request already exists
        from .models import FriendRequest
        existing_request = FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=to_user) |
            Q(from_user=to_user, to_user=request.user)
        ).first()
        
        if existing_request:
            if existing_request.status == 'pending':
                return Response({'error': 'Friend request already pending'}, status=400)
            elif existing_request.status == 'accepted':
                return Response({'error': 'Already friends'}, status=400)
        
        # Create friend request
        friend_request = FriendRequest.objects.create(
            from_user=request.user,
            to_user=to_user,
            status='pending'
        )
        
        return Response({
            'message': 'Friend request sent',
            'request_id': friend_request.id
        }, status=201)

class RespondFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, request_id):
        action = request.data.get('action')  # 'accept' or 'reject'
        
        if action not in ['accept', 'reject']:
            return Response({'error': 'Invalid action'}, status=400)
        
        from .models import FriendRequest
        try:
            friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found'}, status=404)
        
        if friend_request.status != 'pending':
            return Response({'error': 'Friend request already processed'}, status=400)
        
        if action == 'accept':
            friend_request.status = 'accepted'
            message = 'Friend request accepted'
        else:
            friend_request.status = 'rejected'
            message = 'Friend request rejected'
        
        friend_request.save()
        
        return Response({'message': message}, status=200)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, friend_id):
        from .models import FriendRequest
        
        try:
            friend_user = User.objects.get(id=friend_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        if friend_user == request.user:
            return Response({'error': 'Cannot remove yourself'}, status=400)
        
        # Find and delete the friendship (works both ways)
        friend_request = FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=friend_user) |
            Q(from_user=friend_user, to_user=request.user),
            status='accepted'
        ).first()
        
        if not friend_request:
            return Response({'error': 'Friend connection not found'}, status=404)
        
        friend_request.delete()
        return Response({'message': 'Friend removed successfully'}, status=200)

class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import FriendRequest
        
        # Get all accepted friend requests where user is either sender or receiver
        friend_requests = FriendRequest.objects.filter(
            Q(from_user=request.user, status='accepted') |
            Q(to_user=request.user, status='accepted')
        )
        
        # Extract friend users
        friends = []
        for fr in friend_requests:
            friend = fr.to_user if fr.from_user == request.user else fr.from_user
            friends.append(friend)
        
        serializer = UserSerializer(friends, many=True)
        return Response({'friends': serializer.data}, status=200)

class PendingRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import FriendRequest
        
        # Get pending requests received by the user
        received_requests = FriendRequest.objects.filter(
            to_user=request.user,
            status='pending'
        )
        
        # Get pending requests sent by the user
        sent_requests = FriendRequest.objects.filter(
            from_user=request.user,
            status='pending'
        )
        
        received_data = [{
            'id': req.id,
            'from_user': UserSerializer(req.from_user).data,
            'created_at': req.created_at
        } for req in received_requests]
        
        sent_data = [{
            'id': req.id,
            'to_user': UserSerializer(req.to_user).data,
            'created_at': req.created_at
        } for req in sent_requests]
        
        return Response({
            'received': received_data,
            'sent': sent_data
        }, status=200)

class CreateGroupChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .models import GroupChat
        from .serializers import GroupChatSerializer
        
        name = request.data.get('name', '').strip()
        member_ids = request.data.get('member_ids', [])
        
        if not name:
            return Response({'error': 'Group name is required'}, status=400)
        
        if not member_ids:
            return Response({'error': 'At least one member is required'}, status=400)
        
        # Include creator in member count
        if len(member_ids) + 1 > 12:
            return Response({'error': 'Maximum 12 members allowed'}, status=400)
        
        # Verify all members exist
        members = User.objects.filter(id__in=member_ids)
        if members.count() != len(member_ids):
            return Response({'error': 'Some users not found'}, status=404)
        
        # Create group
        group = GroupChat.objects.create(
            name=name,
            created_by=request.user
        )
        
        # Add members (including creator)
        group.members.add(request.user)
        group.members.add(*members)
        
        serializer = GroupChatSerializer(group)
        return Response(serializer.data, status=201)

class GroupChatListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import GroupChat
        from .serializers import GroupChatSerializer
        
        groups = GroupChat.objects.filter(members=request.user)
        serializer = GroupChatSerializer(groups, many=True)
        return Response({'groups': serializer.data}, status=200)

class GroupChatDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        from .models import GroupChat
        from .serializers import GroupChatSerializer
        
        try:
            group = GroupChat.objects.get(id=group_id, members=request.user)
        except GroupChat.DoesNotExist:
            return Response({'error': 'Group not found or access denied'}, status=404)
        
        serializer = GroupChatSerializer(group)
        return Response(serializer.data, status=200)

class GroupMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        from .models import GroupChat, GroupMessage
        from .serializers import GroupMessageSerializer
        
        try:
            group = GroupChat.objects.get(id=group_id, members=request.user)
        except GroupChat.DoesNotExist:
            return Response({'error': 'Group not found or access denied'}, status=404)
        
        messages = group.messages.all()[:100]  # Last 100 messages
        serializer = GroupMessageSerializer(messages, many=True)
        return Response({'messages': serializer.data}, status=200)
    
    def post(self, request, group_id):
        from .models import GroupChat, GroupMessage
        from .serializers import GroupMessageSerializer
        
        try:
            group = GroupChat.objects.get(id=group_id, members=request.user)
        except GroupChat.DoesNotExist:
            return Response({'error': 'Group not found or access denied'}, status=404)
        
        content = request.data.get('content', '').strip()
        image = request.data.get('image', '')
        
        if not content and not image:
            return Response({'error': 'Message content or image is required'}, status=400)
        
        message = GroupMessage.objects.create(
            group=group,
            sender=request.user,
            content=content,
            image=image
        )
        
        # Update group's updated_at timestamp
        group.save()
        
        serializer = GroupMessageSerializer(message)
        return Response(serializer.data, status=201)

class AddGroupMembersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, group_id):
        from .models import GroupChat
        
        try:
            group = GroupChat.objects.get(id=group_id, members=request.user)
        except GroupChat.DoesNotExist:
            return Response({'error': 'Group not found or access denied'}, status=404)
        
        # Only creator can add members
        if group.created_by != request.user:
            return Response({'error': 'Only group creator can add members'}, status=403)
        
        member_ids = request.data.get('member_ids', [])
        
        if not member_ids:
            return Response({'error': 'No members to add'}, status=400)
        
        # Check total member count after adding
        if group.member_count() + len(member_ids) > 12:
            return Response({'error': 'Maximum 12 members allowed'}, status=400)
        
        members = User.objects.filter(id__in=member_ids)
        if members.count() != len(member_ids):
            return Response({'error': 'Some users not found'}, status=404)
        
        group.members.add(*members)
        
        return Response({'message': f'{members.count()} members added'}, status=200)


# Calendar Views
class CalendarListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import SharedCalendar
        from .serializers import SharedCalendarListSerializer
        
        calendars = SharedCalendar.objects.filter(members=request.user)
        serializer = SharedCalendarListSerializer(calendars, many=True)
        return Response({'calendars': serializer.data})
    
    def post(self, request):
        from .models import SharedCalendar
        from .serializers import SharedCalendarListSerializer
        
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Calendar name is required'}, status=400)
        
        calendar = SharedCalendar.objects.create(name=name, created_by=request.user)
        calendar.members.add(request.user)
        
        serializer = SharedCalendarListSerializer(calendar)
        return Response({'calendar': serializer.data}, status=201)


class CalendarDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, calendar_id):
        from .models import SharedCalendar
        from .serializers import SharedCalendarSerializer
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
        except SharedCalendar.DoesNotExist:
            return Response({'error': 'Calendar not found or access denied'}, status=404)
        
        serializer = SharedCalendarSerializer(calendar)
        return Response({'calendar': serializer.data})


class CalendarInviteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, calendar_id):
        from .models import SharedCalendar
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, created_by=request.user)
        except SharedCalendar.DoesNotExist:
            return Response({'error': 'Calendar not found or not authorized'}, status=404)
        
        friend_ids = request.data.get('friend_ids', [])
        if not friend_ids:
            return Response({'error': 'No friends selected'}, status=400)
        
        friends = User.objects.filter(id__in=friend_ids)
        if friends.count() != len(friend_ids):
            return Response({'error': 'Some users not found'}, status=404)
        
        calendar.members.add(*friends)
        return Response({'message': f'{friends.count()} members added'}, status=200)


class CalendarEventListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, calendar_id):
        from .models import SharedCalendar, CalendarEvent
        from .serializers import CalendarEventSerializer
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
        except SharedCalendar.DoesNotExist:
            return Response({'error': 'Calendar not found or access denied'}, status=404)
        
        events = calendar.events.all()
        serializer = CalendarEventSerializer(events, many=True)
        return Response({'events': serializer.data})
    
    def post(self, request, calendar_id):
        from .models import SharedCalendar, CalendarEvent
        from .serializers import CalendarEventSerializer
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
        except SharedCalendar.DoesNotExist:
            return Response({'error': 'Calendar not found or access denied'}, status=404)
        
        title = request.data.get('title')
        description = request.data.get('description', '')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        color = request.data.get('color', '#1a73e8')
        
        if not title or not start_date or not end_date:
            return Response({'error': 'Title, start_date, and end_date are required'}, status=400)
        
        event = CalendarEvent.objects.create(
            calendar=calendar,
            creator=request.user,
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            color=color
        )
        
        serializer = CalendarEventSerializer(event)
        return Response({'event': serializer.data}, status=201)


class CalendarEventDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, calendar_id, event_id):
        from .models import SharedCalendar, CalendarEvent
        from .serializers import CalendarEventSerializer
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
            event = CalendarEvent.objects.get(id=event_id, calendar=calendar)
        except (SharedCalendar.DoesNotExist, CalendarEvent.DoesNotExist):
            return Response({'error': 'Event not found or access denied'}, status=404)
        
        serializer = CalendarEventSerializer(event)
        return Response({'event': serializer.data})
    
    def put(self, request, calendar_id, event_id):
        from .models import SharedCalendar, CalendarEvent
        from .serializers import CalendarEventSerializer
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
            event = CalendarEvent.objects.get(id=event_id, calendar=calendar)
        except (SharedCalendar.DoesNotExist, CalendarEvent.DoesNotExist):
            return Response({'error': 'Event not found or access denied'}, status=404)
        
        # Only creator can edit
        if event.creator != request.user:
            return Response({'error': 'Only creator can edit event'}, status=403)
        
        event.title = request.data.get('title', event.title)
        event.description = request.data.get('description', event.description)
        event.start_date = request.data.get('start_date', event.start_date)
        event.end_date = request.data.get('end_date', event.end_date)
        event.color = request.data.get('color', event.color)
        event.save()
        
        serializer = CalendarEventSerializer(event)
        return Response({'event': serializer.data})
    
    def delete(self, request, calendar_id, event_id):
        from .models import SharedCalendar, CalendarEvent
        
        try:
            calendar = SharedCalendar.objects.get(id=calendar_id, members=request.user)
            event = CalendarEvent.objects.get(id=event_id, calendar=calendar)
        except (SharedCalendar.DoesNotExist, CalendarEvent.DoesNotExist):
            return Response({'error': 'Event not found or access denied'}, status=404)
        
        # Only creator can delete
        if event.creator != request.user:
            return Response({'error': 'Only creator can delete event'}, status=403)
        
        event.delete()
        return Response({'message': 'Event deleted'}, status=200)


# Question Views
class QuestionsListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category=None):
        from .models import Question, QuestionCategory
        from .serializers import QuestionSerializer, QuestionCategorySerializer
        
        if category:
            try:
                cat = QuestionCategory.objects.get(category=category)
                questions = Question.objects.filter(category=cat)
                serializer = QuestionSerializer(questions, many=True)
                return Response(serializer.data)
            except QuestionCategory.DoesNotExist:
                return Response({'error': 'Category not found'}, status=404)
        else:
            categories = QuestionCategory.objects.all()
            cat_serializer = QuestionCategorySerializer(categories, many=True)
            return Response({'categories': cat_serializer.data})


class QuestionCategoriesView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        from .models import QuestionCategory, Question
        from .serializers import QuestionCategorySerializer
        
        categories = QuestionCategory.objects.all()
        data = []
        for cat in categories:
            question_count = Question.objects.filter(category=cat).count()
            data.append({
                'id': cat.id,
                'category': cat.category,
                'name': cat.name,
                'description': cat.description,
                'question_count': question_count
            })
        return Response({'categories': data})


class RandomQuestionView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category=None):
        from .models import Question, QuestionCategory
        from .serializers import QuestionSerializer
        import random
        
        if category:
            try:
                cat = QuestionCategory.objects.get(category=category)
                questions = list(Question.objects.filter(category=cat))
                if not questions:
                    return Response({'error': 'No questions in this category'}, status=404)
                question = random.choice(questions)
                serializer = QuestionSerializer(question)
                return Response(serializer.data)
            except QuestionCategory.DoesNotExist:
                return Response({'error': 'Category not found'}, status=404)
        else:
            from .models import Question
            questions = list(Question.objects.all())
            if not questions:
                return Response({'error': 'No questions found'}, status=404)
            question = random.choice(questions)
            serializer = QuestionSerializer(question)
            return Response(serializer.data)


# Multiplayer Game Views
class GameSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, game_id):
        """Get game session details"""
        try:
            game = GameSession.objects.get(id=game_id)
            # Check if user is a player
            if request.user not in game.players.all():
                return Response({'error': 'Game not found or access denied'}, status=404)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        serializer = GameSessionSerializer(game)
        game_data = serializer.data
        
        # Get all answers for this session (rounds are tracked by current_round field)
        all_answers = game.answers.all()
        
        print(f"[DEBUG] Fetching game {game_id}")
        print(f"[DEBUG] Current question: {game.current_question}")
        print(f"[DEBUG] Current round: {game.current_round}")
        print(f"[DEBUG] Total answers in game: {all_answers.count()}")
        
        # Get current round question and answers
        current_round = None
        if game.current_question:
            current_answers = all_answers.filter(question=game.current_question)
            print(f"[DEBUG] Answers for current question: {current_answers.count()}")
            current_round = {
                'id': game.current_round,
                'question': {
                    'id': game.current_question.id,
                    'question_text': game.current_question.question_text,
                    'turnPicker': {
                        'id': game.category_picker.id if game.category_picker else None,
                        'username': game.category_picker.username if game.category_picker else None
                    }
                },
                'answers': list(PlayerAnswerSerializer(current_answers, many=True).data)
            }
        else:
            print(f"[DEBUG] No current question! Looking for most recent round answers...")
            # If current_question is None, the round may have just been marked complete
            # Try to get answers from the most recent round for the current_turn_user
            # For now, return empty for debugging
            current_round = {
                'id': game.current_round,
                'question': None,
                'answers': []
            }
        
        print(f"[DEBUG] Returning current_round with {len(current_round.get('answers', []))} answers")
        
        # Return structured response
        return Response({
            'session': game_data,
            'rounds': [{'round': game.current_round, 'question': game.current_question.question_text if game.current_question else None}],
            'current_round': current_round,
            'scores': game_data.get('player_scores', {})
        })


class GameSessionListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List all game sessions for the user"""
        games = GameSession.objects.filter(players=request.user)
        serializer = GameSessionListSerializer(games, many=True)
        return Response({'games': serializer.data})


class StartGameRoundView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, game_id):
        """Start a new round - category picker selects a category"""
        try:
            game = GameSession.objects.get(id=game_id)
            if request.user not in game.players.all():
                return Response({'error': 'Game not found or access denied'}, status=404)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        # Only current turn user can start round
        print(f"[DEBUG StartGameRound] Checking turn permission:")
        print(f"[DEBUG] game.current_turn_user: {game.current_turn_user} (type={type(game.current_turn_user)})")
        if game.current_turn_user:
            print(f"[DEBUG] current_turn_user id={game.current_turn_user.id}, username={game.current_turn_user.username}")
        else:
            print(f"[DEBUG] WARNING: current_turn_user is None! Defaulting to creator")
            game.current_turn_user = game.creator
            game.save()
        
        print(f"[DEBUG] request.user: {request.user} (id={request.user.id}, username={request.user.username})")
        print(f"[DEBUG] game.creator: {game.creator} (id={game.creator.id}, username={game.creator.username})")
        print(f"[DEBUG] Are they equal? {game.current_turn_user == request.user}")
        
        if game.current_turn_user != request.user:
            print(f"[DEBUG] DENIED: User {request.user.username} is not current turn user {game.current_turn_user.username}")
            return Response({'error': 'Only the current player can pick a category'}, status=403)
        
        print(f"[DEBUG] ALLOWED: User is current turn user")
        
        category_name = request.data.get('category')
        if not category_name:
            return Response({'error': 'Category is required'}, status=400)
        
        try:
            category = QuestionCategory.objects.get(category=category_name)
        except QuestionCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        
        # Get a random question from the category
        import random
        questions = list(Question.objects.filter(category=category))
        if not questions:
            return Response({'error': 'No questions in this category'}, status=404)
        
        question = random.choice(questions)
        # Set up round state
        game.current_question = question
        game.current_round += 1
        game.status = 'in_progress'
        # Ensure the category picker is the current turn user for this round
        game.category_picker = game.current_turn_user
        game.save()
        
        # Return structured response matching GameSessionDetailView format
        serializer = GameSessionSerializer(game)
        game_data = serializer.data
        
        # Get current round data
        all_answers = game.answers.all()
        current_round = None
        if game.current_question:
            current_answers = all_answers.filter(question=game.current_question)
            current_round = {
                'id': game.current_round,
                'question': {
                    'id': game.current_question.id,
                    'question_text': game.current_question.question_text
                },
                'answers': list(PlayerAnswerSerializer(current_answers, many=True).data)
            }
        
        # Broadcast round start to websocket clients
        broadcast_game_update(game.id, {
            'type': 'round_started',
            'game_id': game.id,
            'round_id': game.current_round,
            'question': {
                'id': game.current_question.id,
                'text': game.current_question.question_text,
                'points': game.current_question.points,
            },
            'picker': game.category_picker.username if game.category_picker else None,
        })

        return Response({
            'session': game_data,
            'rounds': [{'round': game.current_round, 'question': game.current_question.question_text if game.current_question else None}],
            'current_round': current_round,
            'scores': game_data.get('player_scores', {})
        })

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, game_id):
        """Player submits an answer to the current question"""
        import time
        request_time = time.time()
        print(f"\n[DEBUG SubmitAnswerView] ===== REQUEST RECEIVED at {request_time} =====")
        print(f"[DEBUG SubmitAnswerView] Request received from {request.user.username}")
        print(f"[DEBUG] Game ID: {game_id}")
        print(f"[DEBUG] Request data: {request.data}")
        
        try:
            game = GameSession.objects.get(id=game_id)
            print(f"[DEBUG] Game found: ID={game.id}, Current question: {game.current_question}")
            if request.user not in game.players.all():
                print(f"[DEBUG] ERROR: User {request.user.username} not in players: {[p.username for p in game.players.all()]}")
                return Response({'error': 'Game not found or access denied. You are not a player in this game.'}, status=404)
        except GameSession.DoesNotExist:
            print(f"[DEBUG] ERROR: Game {game_id} not found")
            return Response({'error': 'Game not found or access denied. Invalid game ID.'}, status=404)
        
        if not game.current_question:
            print(f"[DEBUG] ERROR: No current question in game {game.id}")
            return Response({'error': 'No current question'}, status=400)
        
        answer_text = request.data.get('answer')
        if not answer_text:
            print(f"[DEBUG] ERROR: No answer text provided")
            return Response({'error': 'Answer is required'}, status=400)
        
        print(f"[DEBUG] SubmitAnswer: Player {request.user.username} submitting answer '{answer_text}' to Q{game.current_question.id}")
        print(f"[DEBUG] Game ID: {game.id}, Round: {game.current_round}, Current Question ID: {game.current_question.id}")
        
        # Check if player already answered this question
        player_answer, created = PlayerAnswer.objects.get_or_create(
            game_session=game,
            player=request.user,
            question=game.current_question,
            defaults={'answer_text': answer_text}
        )
        
        print(f"[DEBUG] PlayerAnswer object: ID={player_answer.id}, Created={created}")
        print(f"[DEBUG] Player: {player_answer.player.username}, Question: {player_answer.question.id}, Answer: {player_answer.answer_text}")

        if not created:
            print(f"[DEBUG] Answer already existed, updating...")
            player_answer.answer_text = answer_text
            # Reset points for re-submission; will be recomputed below
            player_answer.points_awarded = 0
            player_answer.save()

        print(f"[DEBUG] Answer saved. Created: {created}, Answer ID: {player_answer.id}")
        
        # IMMEDIATELY re-check the count after saving
        all_answers_for_question = PlayerAnswer.objects.filter(
            game_session=game,
            question=game.current_question
        )
        print(f"[DEBUG] RE-CHECK: Total PlayerAnswer records for this question: {all_answers_for_question.count()}")
        for pa in all_answers_for_question:
            print(f"[DEBUG]   - Player: {pa.player.username}, Answer: {pa.answer_text[:30]}, ID: {pa.id}")

        points_earned = 0

        # Determine canonical answer: category picker defines the round's correct answer
        try:
            picker = game.category_picker or game.current_turn_user
        except Exception:
            picker = game.current_turn_user

        canonical_answer = None
        if picker:
            canonical = PlayerAnswer.objects.filter(
                game_session=game,
                player=picker,
                question=game.current_question
            ).first()
            if canonical:
                canonical_answer = normalize_answer(canonical.answer_text)

        submitted_answer_norm = normalize_answer(player_answer.answer_text)

        # If the submitting player is the picker, set/refresh canonical and recompute others' points
        if picker and request.user == picker:
            canonical_answer = submitted_answer_norm
            # Update points for all other players who already answered (fuzzy)
            others = PlayerAnswer.objects.filter(
                game_session=game,
                question=game.current_question
            ).exclude(player=picker)
            for ans in others:
                ans.points_awarded = award_points(
                    normalize_answer(ans.answer_text),
                    canonical_answer,
                    game.current_question.points
                )
                ans.save()
            # Picker does not earn points for defining the answer
            player_answer.points_awarded = 0
            player_answer.save()
        else:
            # Non-picker submissions earn points based on fuzzy similarity to canonical
            if canonical_answer is not None and submitted_answer_norm:
                points_earned = award_points(submitted_answer_norm, canonical_answer, game.current_question.points)
                player_answer.points_awarded = points_earned
                player_answer.save()

        # Round completion metrics
        total_players = game.players.count()
        answered_count = PlayerAnswer.objects.filter(
            game_session=game,
            question=game.current_question
        ).count()
        round_completed = answered_count >= total_players if total_players > 0 else False
        
        print(f"[DEBUG] Round metrics: {answered_count}/{total_players} answered")
        print(f"[DEBUG] Round completed: {round_completed}")

        # Broadcast answer submission
        broadcast_game_update(game.id, {
            'type': 'answer_submitted',
            'game_id': game.id,
            'round_id': game.current_round,
            'player': request.user.username,
            'answered_count': answered_count,
            'total_players': total_players,
            'points_earned': points_earned,
        })

        # If round completed, broadcast completion
        if round_completed:
            print(f"[DEBUG] Round is complete! Answers: {answered_count}/{total_players}")
            print(f"[DEBUG] NOT clearing current_question yet - let frontend fetch all answers first")
            # NOTE: We do NOT clear current_question here anymore!
            # The frontend needs to fetch answers while current_question is still set
            # NextRoundView will clear it when actually advancing to next round

            # Compute latest scores to include in broadcast
            from .serializers import GameSessionSerializer
            scores = GameSessionSerializer(game).data.get('player_scores', {})

            broadcast_game_update(game.id, {
                'type': 'round_completed',
                'game_id': game.id,
                'round_id': game.current_round,
                'scores': scores,
            })

        # Include updated scores in the response for immediate UI refresh
        from .serializers import GameSessionSerializer
        response_scores = GameSessionSerializer(game).data.get('player_scores', {})

        print(f"[DEBUG SubmitAnswerView] ===== SENDING RESPONSE at {time.time()} =====")
        print(f"[DEBUG] answered_count in response: {answered_count}, total_players: {total_players}")
        print(f"[DEBUG] Response: message='Answer submitted', points={points_earned}, answered={answered_count}/{total_players}")

        return Response({
            'message': 'Answer submitted',
            'points_earned': points_earned,
            'answered_count': answered_count,
            'total_players': total_players,
            'round_completed': round_completed,
            'scores': response_scores,
        }, status=200)


class GetAnswersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, game_id):
        """Get all answers for the current question from all players"""
        try:
            game = GameSession.objects.get(id=game_id)
            if request.user not in game.players.all():
                return Response({'error': 'Game not found or access denied'}, status=404)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        if not game.current_question:
            return Response({'error': 'No current question'}, status=400)
        
        answers = PlayerAnswer.objects.filter(
            game_session=game,
            question=game.current_question
        )
        
        serializer = PlayerAnswerSerializer(answers, many=True)
        return Response({'answers': serializer.data})


class NextRoundView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, game_id):
        """Move to next round - rotate category picker"""
        try:
            game = GameSession.objects.get(id=game_id, players=request.user)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        # Only creator can advance round
        if game.creator != request.user:
            return Response({'error': 'Only the game creator can advance to next round'}, status=403)
        
        print(f"\n[DEBUG] NextRound: Creator {request.user.username} advancing to next round")
        print(f"[DEBUG] Current round: {game.current_round}, Current question: {game.current_question.id if game.current_question else None}")
        
        # Get list of players and find next picker
        players = list(game.players.all())
        current_index = players.index(game.category_picker) if game.category_picker in players else -1
        next_index = (current_index + 1) % len(players)
        
        game.category_picker = players[next_index]
        # Align current_turn_user with the new picker
        game.current_turn_user = players[next_index]
        
        # NOW we can clear the old question
        game.current_question = None
        
        # Increment round counter
        game.current_round += 1
        
        print(f"[DEBUG] Advanced to round {game.current_round}")
        print(f"[DEBUG] Next picker: {game.category_picker.username}")
        
        # Check if game should end (after all players have picked once per round)
        max_rounds = 3  # Configurable
        if game.current_round > max_rounds * len(players):
            game.status = 'completed'
            print(f"[DEBUG] Game completed! Max rounds ({max_rounds * len(players)}) reached")
        
        game.save()
        
        serializer = GameSessionSerializer(game)

        broadcast_game_update(game.id, {
            'type': 'next_round',
            'game_id': game.id,
            'current_round': game.current_round,
            'next_picker': game.category_picker.username if game.category_picker else None,
        })

        return Response(serializer.data)


class EndGameView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, game_id):
        """End the game and calculate final scores"""
        try:
            game = GameSession.objects.get(id=game_id, players=request.user)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        # Only creator can end game
        if game.creator != request.user:
            return Response({'error': 'Only the game creator can end the game'}, status=403)
        
        game.status = 'completed'
        game.save()
        
        serializer = GameSessionSerializer(game)

        broadcast_game_update(game.id, {
            'type': 'game_ended',
            'game_id': game.id,
            'scores': serializer.data.get('player_scores', {}),
        })

        return Response(serializer.data)


class JoinGameByCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Join an existing game session using a 6-character code"""
        code = request.data.get('game_code') or request.data.get('code')
        if not code or len(str(code).strip()) != 6:
            return Response({'error': 'Valid 6-character game code is required'}, status=400)

        code = str(code).strip().upper()

        try:
            session = GameSession.objects.get(game_code=code)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found. Check the code and try again.'}, status=404)

        if session.status == 'completed':
            return Response({'error': 'Game has already completed'}, status=400)

        # Add the user as a player if not already joined
        if request.user not in session.players.all():
            session.players.add(request.user)
            session.save()

        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=200)


class UserResponsesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import QuestionResponse
        from .serializers import QuestionResponseSerializer
        
        responses = QuestionResponse.objects.filter(user=request.user)
        serializer = QuestionResponseSerializer(responses, many=True)
        
        return Response({'responses': serializer.data}, status=200)

class CreateGameSessionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .models import GameSession, QuestionCategory
        from .serializers import GameSessionSerializer
        import random
        import string
        
        participant_ids = request.data.get('participant_ids', [])
        categories = request.data.get('categories', [])
        
        try:
            # Generate unique 6-character game code
            game_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            while GameSession.objects.filter(game_code=game_code).exists():
                game_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
            # Create game session
            session = GameSession.objects.create(
                creator=request.user,
                game_code=game_code,
                status='waiting'
            )
            
            # Add creator as player
            session.players.add(request.user)
            
            # Add other participants if provided
            if participant_ids:
                other_participants = User.objects.filter(id__in=participant_ids)
                session.players.add(*other_participants)
            
            # Add selected categories
            if categories:
                category_objects = QuestionCategory.objects.filter(category__in=categories)
                session.categories.add(*category_objects)
            
            # Set creator as category picker and current turn user for first round
            session.category_picker = request.user
            session.current_turn_user = request.user
            session.save()
            
            print(f"[DEBUG CreateGame] Game created:")
            print(f"[DEBUG] Code: {session.game_code}")
            print(f"[DEBUG] Creator: {session.creator.username} (id={session.creator.id})")
            print(f"[DEBUG] Current turn user: {session.current_turn_user.username} (id={session.current_turn_user.id})")
            print(f"[DEBUG] Category picker: {session.category_picker.username} (id={session.category_picker.id})")
            
            serializer = GameSessionSerializer(session)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class GetRandomQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .models import Question, GameSession, GameRound, GameTurn
        from .serializers import GameRoundSerializer
        import random
        
        session_id = request.data.get('session_id')
        category = request.data.get('category')
        
        if not session_id or not category:
            return Response({'error': 'Session ID and category are required'}, status=400)
        
        try:
            session = GameSession.objects.get(id=session_id)
            
            # Check if it's the current user's turn
            print(f"Category pick attempt - User: {request.user.username}, Current turn: {session.current_turn_user.username if session.current_turn_user else 'None'}")
            if session.current_turn_user != request.user:
                return Response({'error': f'Not your turn. Current turn: {session.current_turn_user.username if session.current_turn_user else "None"}'}, status=403)
            
            # Get all questions in category
            questions = Question.objects.filter(category=category)
            
            # Get already asked questions in this session
            asked_question_ids = GameRound.objects.filter(
                session=session
            ).values_list('question_id', flat=True)
            
            # Filter out asked questions
            available_questions = questions.exclude(id__in=asked_question_ids)
            
            if not available_questions:
                return Response({'error': 'No more questions in this category'}, status=404)
            
            # Pick random question
            question = random.choice(available_questions)
            
            # Create game round - this question is for ALL players
            round_obj = GameRound.objects.create(
                session=session,
                question=question,
                picker=request.user
            )
            
            # Create answer slots for all participants (use get_or_create to prevent duplicates)
            participants = session.participants.distinct()
            print(f"Creating answer slots for {participants.count()} participants: {[p.username for p in participants]}")
            for participant in participants:
                turn, created = GameTurn.objects.get_or_create(
                    round=round_obj,
                    player=participant
                )
                if created:
                    print(f"  Created turn for {participant.username}")
                else:
                    print(f"  Turn already exists for {participant.username}")
            
            # Refresh to get all related data
            round_obj.refresh_from_db()
            round_obj = GameRound.objects.prefetch_related(
                'answers__player', 'question', 'picker'
            ).get(id=round_obj.id)
            
            serializer = GameRoundSerializer(round_obj)
            print(f"Created round {round_obj.id} with question {question.question_number} for {session.participants.count()} players")
            return Response({'round': serializer.data}, status=200)
        except GameSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

class SubmitGameAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .models import GameTurn, GameRound
        from .serializers import GameTurnSerializer
        from django.utils import timezone
        
        round_id = request.data.get('round_id')
        answer = request.data.get('answer')
        
        if not round_id or not answer:
            return Response({'error': 'Round ID and answer are required'}, status=400)
        
        try:
            round_obj = GameRound.objects.get(id=round_id)
            turn = GameTurn.objects.get(round=round_obj, player=request.user)
            
            # Save answer
            turn.answer = answer
            turn.answered_at = timezone.now()
            turn.save()
            
            # If this is the picker, save picker_answer
            if round_obj.picker == request.user:
                round_obj.picker_answer = answer
                round_obj.save()
            
            # Check if all players have answered
            all_answers = GameTurn.objects.filter(round=round_obj)
            answered_count = all_answers.filter(answered_at__isnull=False).count()
            total_players = all_answers.count()
            
            print(f"Answer submitted - Player: {request.user.username}, Round: {round_id}")
            print(f"  Answered: {answered_count}/{total_players}")
            
            round_completed = False
            if answered_count == total_players:
                print(f"  All players answered! Calculating points...")
                # All players answered - calculate points
                picker_answer = round_obj.picker_answer
                points = round_obj.question.points
                
                print(f"  Picker answer: {picker_answer}, Question points: {points}")
                
                for turn_obj in all_answers:
                    if turn_obj.player == round_obj.picker:
                        # Picker gets points automatically
                        turn_obj.points_earned = points
                        print(f"  {turn_obj.player.username} (picker) earned {points} points")
                    else:
                        # Compare answer with picker's answer (simple contains check)
                        if picker_answer and turn_obj.answer:
                            # Award points if answers are similar
                            if picker_answer.lower() in turn_obj.answer.lower() or turn_obj.answer.lower() in picker_answer.lower():
                                turn_obj.points_earned = points
                                print(f"  {turn_obj.player.username} earned {points} points (answer matches)")
                            else:
                                turn_obj.points_earned = 0
                                print(f"  {turn_obj.player.username} earned 0 points (no match)")
                        else:
                            turn_obj.points_earned = 0
                            print(f"  {turn_obj.player.username} earned 0 points (no answer)")
                    turn_obj.save()
                
                # Mark round as completed
                round_obj.is_completed = True
                round_obj.save()
                round_completed = True
                
                # Move to next turn
                session = round_obj.session
                session.next_turn()
                print(f"  Round completed! Next turn: {session.current_turn_user.username}")
            
            serializer = GameTurnSerializer(turn)
            return Response({
                'turn': serializer.data,
                'round_completed': round_completed,
                'all_answered': answered_count == total_players,
                'answered_count': answered_count,
                'total_players': total_players,
                'points_earned': turn.points_earned
            }, status=200)
        except GameRound.DoesNotExist:
            return Response({'error': 'Round not found'}, status=404)
        except GameTurn.DoesNotExist:
            return Response({'error': 'Turn not found'}, status=404)


# Journal Prompt Views
class JournalPromptsListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all journal prompts with optional filtering"""
        from .serializers import JournalPromptSerializer
        
        difficulty = request.query_params.get('difficulty')
        
        prompts = JournalPrompt.objects.all()
        if difficulty:
            prompts = prompts.filter(difficulty=difficulty)
        
        serializer = JournalPromptSerializer(prompts, many=True)
        return Response({'prompts': serializer.data, 'count': prompts.count()})


class RandomJournalPromptView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get a random journal prompt"""
        import random
        from .serializers import JournalPromptSerializer
        
        difficulty = request.query_params.get('difficulty')
        
        prompts = JournalPrompt.objects.all()
        if difficulty:
            prompts = prompts.filter(difficulty=difficulty)
        
        prompts = list(prompts)
        if not prompts:
            return Response({'error': 'No prompts available'}, status=404)
        
        prompt = random.choice(prompts)
        serializer = JournalPromptSerializer(prompt)
        return Response(serializer.data)

# Shared Journal Views
class SharedJournalListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all shared journals where user is a member or creator"""
        from .serializers import SharedJournalListSerializer
        from .models import SharedJournal
        
        journals = SharedJournal.objects.filter(
            Q(created_by=request.user) | Q(members=request.user)
        ).distinct()
        
        serializer = SharedJournalListSerializer(journals, many=True)
        return Response({'journals': serializer.data, 'count': journals.count()})
    
    def post(self, request):
        """Create a new shared journal"""
        from .serializers import SharedJournalSerializer
        from .models import SharedJournal
        
        name = request.data.get('name')
        description = request.data.get('description', '')
        
        if not name:
            return Response({'error': 'Journal name is required'}, status=400)
        
        journal = SharedJournal.objects.create(
            name=name,
            description=description,
            created_by=request.user
        )
        journal.members.add(request.user)
        
        serializer = SharedJournalSerializer(journal)
        return Response(serializer.data, status=201)


class SharedJournalDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, journal_id):
        """Get journal details"""
        from .serializers import SharedJournalSerializer
        from .models import SharedJournal
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            # Check if user is member or creator
            if request.user != journal.created_by and request.user not in journal.members.all():
                return Response({'error': 'Access denied'}, status=403)
            
            serializer = SharedJournalSerializer(journal)
            return Response(serializer.data)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)
    
    def put(self, request, journal_id):
        """Update journal details (creator only)"""
        from .serializers import SharedJournalSerializer
        from .models import SharedJournal
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            if request.user != journal.created_by:
                return Response({'error': 'Only creator can update journal'}, status=403)
            
            journal.name = request.data.get('name', journal.name)
            journal.description = request.data.get('description', journal.description)
            journal.save()
            
            serializer = SharedJournalSerializer(journal)
            return Response(serializer.data)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)
    
    def delete(self, request, journal_id):
        """Delete journal (creator only)"""
        from .models import SharedJournal
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            if request.user != journal.created_by:
                return Response({'error': 'Only creator can delete journal'}, status=403)
            
            journal.delete()
            return Response({'message': 'Journal deleted'}, status=204)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)


class SharedJournalMembersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, journal_id):
        """Add a member to the journal"""
        from .models import SharedJournal, User
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            if request.user != journal.created_by:
                return Response({'error': 'Only creator can add members'}, status=403)
            
            member_id = request.data.get('member_id')
            if not member_id:
                return Response({'error': 'member_id is required'}, status=400)
            
            try:
                member = User.objects.get(id=member_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
            
            journal.members.add(member)
            
            from .serializers import SharedJournalSerializer
            serializer = SharedJournalSerializer(journal)
            return Response(serializer.data)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)
    
    def delete(self, request, journal_id):
        """Remove a member from the journal"""
        from .models import SharedJournal, User
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            if request.user != journal.created_by:
                return Response({'error': 'Only creator can remove members'}, status=403)
            
            member_id = request.data.get('member_id')
            if not member_id:
                return Response({'error': 'member_id is required'}, status=400)
            
            try:
                member = User.objects.get(id=member_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
            
            journal.members.remove(member)
            
            from .serializers import SharedJournalSerializer
            serializer = SharedJournalSerializer(journal)
            return Response(serializer.data)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)


class JournalEntryListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, journal_id):
        """Get all entries for a journal"""
        from .serializers import JournalEntrySerializer
        from .models import SharedJournal, JournalEntry
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            # Check if user is member or creator
            if request.user != journal.created_by and request.user not in journal.members.all():
                return Response({'error': 'Access denied'}, status=403)
            
            entries = JournalEntry.objects.filter(journal=journal).order_by('-created_at')
            serializer = JournalEntrySerializer(entries, many=True)
            return Response({'entries': serializer.data, 'count': entries.count()})
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)
    
    def post(self, request, journal_id):
        """Add a new entry to the journal"""
        from .serializers import JournalEntrySerializer
        from .models import SharedJournal, JournalEntry
        
        try:
            journal = SharedJournal.objects.get(id=journal_id)
            
            # Check if user is member or creator
            if request.user != journal.created_by and request.user not in journal.members.all():
                return Response({'error': 'Access denied'}, status=403)
            
            title = request.data.get('title', '')
            content = request.data.get('content')
            
            if not content:
                return Response({'error': 'Content is required'}, status=400)
            
            entry = JournalEntry.objects.create(
                journal=journal,
                author=request.user,
                title=title,
                content=content
            )
            
            serializer = JournalEntrySerializer(entry)
            return Response(serializer.data, status=201)
        except SharedJournal.DoesNotExist:
            return Response({'error': 'Journal not found'}, status=404)


# Shared Prompt Session Views
class SharedPromptSessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all shared prompt sessions where user is a member or creator"""
        from .serializers import SharedPromptSessionListSerializer
        from .models import SharedPromptSession
        
        sessions = SharedPromptSession.objects.filter(
            Q(created_by=request.user) | Q(members=request.user)
        ).distinct().order_by('-created_at')
        
        serializer = SharedPromptSessionListSerializer(sessions, many=True)
        return Response({'sessions': serializer.data, 'count': sessions.count()})
    
    def post(self, request):
        """Create a new shared prompt session"""
        from .serializers import SharedPromptSessionSerializer
        from .models import SharedPromptSession, JournalPrompt
        
        prompt_id = request.data.get('prompt_id')
        title = request.data.get('title', '')
        
        if not prompt_id:
            return Response({'error': 'prompt_id is required'}, status=400)
        
        try:
            prompt = JournalPrompt.objects.get(id=prompt_id)
        except JournalPrompt.DoesNotExist:
            return Response({'error': 'Prompt not found'}, status=404)
        
        session = SharedPromptSession.objects.create(
            prompt=prompt,
            created_by=request.user,
            title=title or prompt.prompt_text[:50]
        )
        session.members.add(request.user)
        
        serializer = SharedPromptSessionSerializer(session)
        return Response(serializer.data, status=201)


class SharedPromptSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        """Get prompt session details with all responses"""
        from .serializers import SharedPromptSessionSerializer
        from .models import SharedPromptSession
        
        try:
            session = SharedPromptSession.objects.get(id=session_id)
            
            # Check if user is member or creator
            if request.user != session.created_by and request.user not in session.members.all():
                return Response({'error': 'Access denied'}, status=403)
            
            serializer = SharedPromptSessionSerializer(session)
            return Response(serializer.data)
        except SharedPromptSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)
    
    def delete(self, request, session_id):
        """Delete session (creator only)"""
        from .models import SharedPromptSession
        
        try:
            session = SharedPromptSession.objects.get(id=session_id)
            
            if request.user != session.created_by:
                return Response({'error': 'Only creator can delete session'}, status=403)
            
            session.delete()
            return Response({'message': 'Session deleted'}, status=204)
        except SharedPromptSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)


class SharedPromptSessionMembersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        """Add a member to the prompt session"""
        from .models import SharedPromptSession, User
        
        try:
            session = SharedPromptSession.objects.get(id=session_id)
            
            if request.user != session.created_by:
                return Response({'error': 'Only creator can add members'}, status=403)
            
            member_id = request.data.get('member_id')
            if not member_id:
                return Response({'error': 'member_id is required'}, status=400)
            
            try:
                member = User.objects.get(id=member_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
            
            session.members.add(member)
            
            from .serializers import SharedPromptSessionSerializer
            serializer = SharedPromptSessionSerializer(session)
            return Response(serializer.data)
        except SharedPromptSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)
    
    def delete(self, request, session_id):
        """Remove a member from the prompt session"""
        from .models import SharedPromptSession, User
        
        try:
            session = SharedPromptSession.objects.get(id=session_id)
            
            if request.user != session.created_by:
                return Response({'error': 'Only creator can remove members'}, status=403)
            
            member_id = request.data.get('member_id')
            if not member_id:
                return Response({'error': 'member_id is required'}, status=400)
            
            try:
                member = User.objects.get(id=member_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
            
            session.members.remove(member)
            
            from .serializers import SharedPromptSessionSerializer
            serializer = SharedPromptSessionSerializer(session)
            return Response(serializer.data)
        except SharedPromptSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)


class PromptResponseListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        """Create or update a response to a prompt session"""
        from .serializers import PromptResponseSerializer
        from .models import SharedPromptSession, PromptResponse
        
        try:
            session = SharedPromptSession.objects.get(id=session_id)
            
            # Check if user is member or creator
            if request.user != session.created_by and request.user not in session.members.all():
                return Response({'error': 'Access denied'}, status=403)
            
            response_text = request.data.get('response')
            if not response_text:
                return Response({'error': 'Response is required'}, status=400)
            
            # Create or update response
            response_obj, created = PromptResponse.objects.update_or_create(
                session=session,
                author=request.user,
                defaults={'response': response_text}
            )
            
            serializer = PromptResponseSerializer(response_obj)
            return Response(serializer.data, status=201 if created else 200)
        except SharedPromptSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)


class AddFriendView(APIView):
    """Add or create a friendship between two users"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            friend_id = request.data.get('friend_id')
            if not friend_id:
                return Response({'error': 'friend_id required'}, status=400)
            
            friend = User.objects.get(id=friend_id)
            
            # Prevent self-friendship
            if friend.id == request.user.id:
                return Response({'error': 'Cannot add yourself as a friend'}, status=400)
            
            # Create friendship (bidirectional)
            friendship1, created1 = Friendship.objects.get_or_create(
                user1_id=min(request.user.id, friend.id),
                user2_id=max(request.user.id, friend.id)
            )
            
            if created1:
                return Response({
                    'status': 'Friend added',
                    'friendship_id': friendship1.id
                }, status=201)
            else:
                return Response({
                    'status': 'Already friends',
                    'friendship_id': friendship1.id
                }, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class RemoveFriendView(APIView):
    """Remove friendship between two users"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            friend_id = request.data.get('friend_id')
            if not friend_id:
                return Response({'error': 'friend_id required'}, status=400)
            
            # Delete friendship (works because we store bidirectional with min/max)
            Friendship.objects.filter(
                user1_id=min(request.user.id, friend_id),
                user2_id=max(request.user.id, friend_id)
            ).delete()
            
            return Response({'status': 'Friend removed'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class ListFriendsView(APIView):
    """List all friends of the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get all friendships where current user is involved
            friendships = Friendship.objects.filter(
                Q(user1=request.user) | Q(user2=request.user)
            )
            
            # Extract the other user from each friendship
            friends = []
            for friendship in friendships:
                other_user = friendship.user2 if friendship.user1 == request.user else friendship.user1
                friends.append(UserSerializer(other_user).data)
            
            return Response({'friends': friends}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class SendDirectMessageView(APIView):
    """Send a direct message to another user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            recipient_id = request.data.get('recipient_id')
            content = request.data.get('content', '')
            image = request.data.get('image', None)
            
            if not recipient_id:
                return Response({'error': 'recipient_id required'}, status=400)
            
            if not content and not image:
                return Response({'error': 'content or image required'}, status=400)
            
            recipient = User.objects.get(id=recipient_id)
            
            # Check if users are friends
            friendship = Friendship.objects.filter(
                user1_id=min(request.user.id, recipient.id),
                user2_id=max(request.user.id, recipient.id)
            ).exists()
            
            if not friendship:
                return Response({'error': 'You must be friends to send messages'}, status=403)
            
            # Create message
            message = DirectMessage.objects.create(
                sender=request.user,
                recipient=recipient,
                content=content,
                image=image
            )
            
            # Broadcast via WebSocket if available
            try:
                channel_layer = get_channel_layer()
                room_name = f"dm_{min(request.user.id, recipient.id)}_{max(request.user.id, recipient.id)}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'direct_message',
                        'sender_id': request.user.id,
                        'sender_username': request.user.username,
                        'content': content,
                        'image': image,
                        'timestamp': message.created_at.isoformat()
                    }
                )
            except Exception as e:
                print(f"WebSocket broadcast failed: {e}")
            
            serializer = DirectMessageSerializer(message)
            return Response(serializer.data, status=201)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class GetDirectMessagesView(APIView):
    """Retrieve direct messages between current user and another user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
            
            # Get all messages between the two users
            messages = DirectMessage.objects.filter(
                Q(sender=request.user, recipient=other_user) |
                Q(sender=other_user, recipient=request.user)
            ).order_by('created_at')
            
            # Mark received messages as read
            DirectMessage.objects.filter(
                sender=other_user,
                recipient=request.user,
                read=False
            ).update(read=True)
            
            serializer = DirectMessageSerializer(messages, many=True)
            return Response({'messages': serializer.data}, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
