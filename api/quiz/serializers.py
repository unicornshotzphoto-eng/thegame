from rest_framework import serializers
from .models import User, GroupChat, GroupMessage, Question, QuestionResponse, GameSession, GameRound, GameTurn


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            
           
        )
        password=validated_data['password']
        user.set_password(password)
        user.save()
        return user 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'thumbnail')

class GroupChatSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupChat
        fields = ('id', 'name', 'created_by', 'members', 'member_count', 'created_at', 'updated_at', 'last_message')
    
    def get_member_count(self, obj):
        return obj.member_count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'sender': last_msg.sender.username,
                'content': last_msg.content[:50],
                'created_at': last_msg.created_at
            }
        return None

class GroupMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = GroupMessage
        fields = ('id', 'group', 'sender', 'content', 'image', 'created_at')

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'category', 'question_number', 'question_text', 'points', 'consequence', 'created_at')

class QuestionResponseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    partner = UserSerializer(read_only=True)
    question = QuestionSerializer(read_only=True)
    
    class Meta:
        model = QuestionResponse
        fields = ('id', 'question', 'user', 'partner', 'response_text', 'is_correct', 'points_earned', 'created_at')

class GameSessionSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    current_turn_user = UserSerializer(read_only=True)
    group = GroupChatSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = ('id', 'session_type', 'group', 'participants', 'current_turn_user', 'turn_order', 'is_active', 'created_at', 'updated_at')

class GameTurnSerializer(serializers.ModelSerializer):
    player = UserSerializer(read_only=True)
    
    class Meta:
        model = GameTurn
        fields = ('id', 'round', 'player', 'answer', 'points_earned', 'answered_at', 'created_at')

class GameRoundSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    picker = UserSerializer(read_only=True)
    answers = GameTurnSerializer(many=True, read_only=True)
    
    class Meta:
        model = GameRound
        fields = ('id', 'session', 'question', 'picker', 'picker_answer', 'answers', 'is_completed', 'created_at')