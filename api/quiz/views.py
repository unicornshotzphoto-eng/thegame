from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response 
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .models import User
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

class QuestionsListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import Question
        from .serializers import QuestionSerializer
        
        category = request.query_params.get('category', 'spiritual_knowing')
        questions = Question.objects.filter(category=category)
        serializer = QuestionSerializer(questions, many=True)
        
        return Response({'questions': serializer.data}, status=200)

class QuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, question_id):
        from .models import Question
        from .serializers import QuestionSerializer
        
        try:
            question = Question.objects.get(id=question_id)
            serializer = QuestionSerializer(question)
            return Response(serializer.data, status=200)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .models import Question, QuestionResponse
        from .serializers import QuestionResponseSerializer
        
        question_id = request.data.get('question_id')
        response_text = request.data.get('response_text')
        partner_id = request.data.get('partner_id')
        
        if not question_id or not response_text:
            return Response({'error': 'Question ID and response text are required'}, status=400)
        
        try:
            question = Question.objects.get(id=question_id)
            partner = User.objects.get(id=partner_id) if partner_id else None
            
            # Create response
            response = QuestionResponse.objects.create(
                question=question,
                user=request.user,
                partner=partner,
                response_text=response_text
            )
            
            serializer = QuestionResponseSerializer(response)
            return Response(serializer.data, status=201)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Partner not found'}, status=404)

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
        from .models import GameSession, GroupChat
        from .serializers import GameSessionSerializer
        import random
        
        session_type = request.data.get('session_type')  # 'direct' or 'group'
        group_id = request.data.get('group_id')
        participant_ids = request.data.get('participant_ids', [])
        
        if session_type not in ['direct', 'group']:
            return Response({'error': 'Invalid session type'}, status=400)
        
        try:
            # Create game session
            session = GameSession.objects.create(session_type=session_type)
            
            # Add participants
            participants = []
            if session_type == 'group' and group_id:
                group = GroupChat.objects.get(id=group_id)
                session.group = group
                participants = list(group.members.all())
            elif session_type == 'direct' and participant_ids:
                # Add current user and other participants, avoiding duplicates
                participant_set = set([request.user.id] + participant_ids)
                participants = list(User.objects.filter(id__in=participant_set))
            else:
                return Response({'error': 'Invalid participants'}, status=400)
            
            # Use set to ensure no duplicate participants
            session.participants.set(participants)
            
            # Set turn order (randomize)
            turn_order = [p.id for p in participants]
            random.shuffle(turn_order)
            session.turn_order = turn_order
            session.current_turn_user = User.objects.get(id=turn_order[0])
            session.save()
            
            serializer = GameSessionSerializer(session)
            return Response(serializer.data, status=201)
        except GroupChat.DoesNotExist:
            return Response({'error': 'Group not found'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

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

class GameSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        from .models import GameSession, GameRound, GameTurn
        from .serializers import GameSessionSerializer, GameRoundSerializer
        
        try:
            session = GameSession.objects.get(id=session_id)
            
            # Check if user is participant
            if request.user not in session.participants.all():
                return Response({'error': 'Not a participant'}, status=403)
            
            rounds = GameRound.objects.filter(session=session).prefetch_related(
                'answers__player', 'question', 'picker'
            )
            
            session_serializer = GameSessionSerializer(session)
            rounds_serializer = GameRoundSerializer(rounds, many=True)
            
            # Get current active round (if any)
            current_round = rounds.filter(is_completed=False).first()
            if current_round:
                print(f"Current round found: {current_round.id}, Question: {current_round.question.question_number}, Answers: {current_round.answers.count()}")
                for answer in current_round.answers.all():
                    print(f"  - Player: {answer.player.username}, Answered: {answer.answered_at is not None}")
            current_round_data = GameRoundSerializer(current_round).data if current_round else None
            
            # Calculate scores
            scores = {}
            for participant in session.participants.all():
                player_turns = GameTurn.objects.filter(
                    round__session=session,
                    player=participant,
                    answered_at__isnull=False
                )
                total_points = sum(t.points_earned for t in player_turns)
                scores[participant.username] = total_points
            
            return Response({
                'session': session_serializer.data,
                'rounds': rounds_serializer.data,
                'current_round': current_round_data,
                'scores': scores
            }, status=200)
        except GameSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

class ActiveGameSessionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import GameSession
        from .serializers import GameSessionSerializer
        
        sessions = GameSession.objects.filter(
            participants=request.user,
            is_active=True
        )
        
        serializer = GameSessionSerializer(sessions, many=True)
        return Response({'sessions': serializer.data}, status=200)

class DeleteGameSessionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, session_id):
        from .models import GameSession
        
        try:
            session = GameSession.objects.get(id=session_id)
            
            # Check if user is a participant
            if request.user not in session.participants.all():
                return Response({'error': 'Not a participant'}, status=403)
            
            # Delete the session (cascades to rounds and turns)
            session.delete()
            print(f"Game session {session_id} deleted by {request.user.username}")
            
            return Response({'message': 'Game session deleted'}, status=200)
        except GameSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)