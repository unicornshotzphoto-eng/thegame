from rest_framework import serializers
<<<<<<< HEAD
from django.db import models
from .models import User, GroupChat, GroupMessage, SharedCalendar, CalendarEvent, Question, QuestionCategory, GameSession, PlayerAnswer
=======
from .models import User, GroupChat, GroupMessage, Question, QuestionResponse, GameSession, GameRound, GameTurn
>>>>>>> main


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

<<<<<<< HEAD

class CalendarEventSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = ('id', 'calendar', 'creator', 'title', 'description', 'start_date', 'end_date', 'color', 'created_at', 'updated_at')


class SharedCalendarSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    events = CalendarEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = SharedCalendar
        fields = ('id', 'name', 'created_by', 'members', 'members_count', 'events', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members_count()


class SharedCalendarListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedCalendar
        fields = ('id', 'name', 'created_by', 'members_count', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members_count()


class QuestionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionCategory
        fields = ('id', 'category', 'name', 'description')


class QuestionSerializer(serializers.ModelSerializer):
    category = QuestionCategorySerializer(read_only=True)
    
    class Meta:
        model = Question
        fields = ('id', 'category', 'question_text', 'points', 'consequence', 'order')


class QuestionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'points', 'consequence')


class PlayerAnswerSerializer(serializers.ModelSerializer):
    player = UserSerializer(read_only=True)
    question = QuestionSerializer(read_only=True)
    
    class Meta:
        model = PlayerAnswer
        fields = ('id', 'player', 'question', 'answer_text', 'points_awarded', 'created_at')


class GameSessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    players = UserSerializer(many=True, read_only=True)
    category_picker = UserSerializer(read_only=True)
    current_question = QuestionSerializer(read_only=True)
    answers = PlayerAnswerSerializer(many=True, read_only=True)
    player_scores = serializers.SerializerMethodField()
    
    class Meta:
        model = GameSession
        fields = ('id', 'creator', 'players', 'status', 'current_round', 'current_question', 
                  'category_picker', 'answers', 'player_scores', 'created_at', 'updated_at')
    
    def get_player_scores(self, obj):
        """Calculate total points for each player"""
        scores = {}
        for player in obj.players.all():
            total_points = obj.answers.filter(player=player).aggregate(
                total=models.Sum('points_awarded')
            )['total'] or 0
            scores[player.username] = total_points
        return scores


class GameSessionListSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    players = UserSerializer(many=True, read_only=True)
    player_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GameSession
        fields = ('id', 'creator', 'players', 'player_count', 'status', 'created_at', 'updated_at')
    
    def get_player_count(self, obj):
        return obj.players.count()
=======
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
>>>>>>> main
