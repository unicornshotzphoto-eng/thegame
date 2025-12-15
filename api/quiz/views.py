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