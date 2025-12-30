from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response 
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, QuestionCategorySerializer, GameSessionSerializer, GameSessionListSerializer, PlayerAnswerSerializer
from .models import User, GameSession, PlayerAnswer, Question, QuestionCategory
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

# Create your views here.

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
class CreateGameSessionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a new multiplayer game session"""
        friend_ids = request.data.get('friend_ids', [])
        
        if not friend_ids:
            return Response({'error': 'At least one friend is required'}, status=400)
        
        # Verify all friends exist
        friends = User.objects.filter(id__in=friend_ids)
        if friends.count() != len(friend_ids):
            return Response({'error': 'Some users not found'}, status=404)
        
        # Create game session
        game = GameSession.objects.create(
            creator=request.user,
            status='waiting'
        )
        
        # Add creator and friends
        game.players.add(request.user)
        game.players.add(*friends)
        
        # Set first player as category picker
        game.category_picker = request.user
        game.save()
        
        serializer = GameSessionSerializer(game)
        return Response(serializer.data, status=201)


class GameSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, game_id):
        """Get game session details"""
        try:
            game = GameSession.objects.get(id=game_id, players=request.user)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        serializer = GameSessionSerializer(game)
        return Response(serializer.data)


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
            game = GameSession.objects.get(id=game_id, players=request.user)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        # Only category picker can start round
        if game.category_picker != request.user:
            return Response({'error': 'Only the category picker can start the round'}, status=403)
        
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
        game.current_question = question
        game.current_round += 1
        game.status = 'in_progress'
        game.save()
        
        serializer = GameSessionSerializer(game)
        return Response(serializer.data)


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, game_id):
        """Player submits an answer to the current question"""
        try:
            game = GameSession.objects.get(id=game_id, players=request.user)
        except GameSession.DoesNotExist:
            return Response({'error': 'Game not found or access denied'}, status=404)
        
        if not game.current_question:
            return Response({'error': 'No current question'}, status=400)
        
        answer_text = request.data.get('answer')
        if not answer_text:
            return Response({'error': 'Answer is required'}, status=400)
        
        # Check if player already answered this question
        existing_answer = PlayerAnswer.objects.filter(
            game_session=game,
            player=request.user,
            question=game.current_question
        ).first()
        
        if existing_answer:
            # Update existing answer
            existing_answer.answer_text = answer_text
            existing_answer.save()
        else:
            # Create new answer
            player_answer = PlayerAnswer.objects.create(
                game_session=game,
                player=request.user,
                question=game.current_question,
                answer_text=answer_text
            )
        
        return Response({'message': 'Answer submitted'}, status=201)


class GetAnswersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, game_id):
        """Get all answers for the current question from all players"""
        try:
            game = GameSession.objects.get(id=game_id, players=request.user)
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
        
        # Get list of players and find next picker
        players = list(game.players.all())
        current_index = players.index(game.category_picker) if game.category_picker in players else -1
        next_index = (current_index + 1) % len(players)
        
        game.category_picker = players[next_index]
        game.current_question = None
        
        # Check if game should end (after all players have picked once per round)
        max_rounds = 3  # Configurable
        if game.current_round >= max_rounds * len(players):
            game.status = 'completed'
        
        game.save()
        
        serializer = GameSessionSerializer(game)
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
        return Response(serializer.data)