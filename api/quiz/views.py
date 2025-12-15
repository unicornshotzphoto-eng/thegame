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