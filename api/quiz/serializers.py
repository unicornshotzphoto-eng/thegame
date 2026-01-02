from rest_framework import serializers
from django.db import models
from .models import User, GroupChat, GroupMessage, SharedCalendar, CalendarEvent, Question, QuestionCategory, GameSession, PlayerAnswer, JournalPrompt, SharedJournal, JournalEntry, SharedPromptSession, PromptResponse, Friendship, DirectMessage


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
    answered_at = serializers.SerializerMethodField()
    
    class Meta:
        model = PlayerAnswer
        fields = ('id', 'player', 'question', 'answer_text', 'points_awarded', 'created_at', 'answered_at')
    
    def get_answered_at(self, obj):
        """Return created_at as answered_at for frontend compatibility"""
        return obj.created_at


class GameSessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    players = UserSerializer(many=True, read_only=True)
    category_picker = UserSerializer(read_only=True)
    current_turn_user = UserSerializer(read_only=True)
    current_question = QuestionSerializer(read_only=True)
    answers = PlayerAnswerSerializer(many=True, read_only=True)
    player_scores = serializers.SerializerMethodField()
    
    class Meta:
        model = GameSession
        fields = ('id', 'creator', 'players', 'status', 'current_round', 'current_question', 
                  'category_picker', 'current_turn_user', 'answers', 'player_scores', 'game_code', 'created_at', 'updated_at')
    
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

class JournalPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalPrompt
        fields = ('id', 'prompt_text', 'category', 'difficulty', 'created_at')


class JournalEntrySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = ('id', 'journal', 'author', 'title', 'content', 'created_at', 'updated_at')


class SharedJournalSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    entries = JournalEntrySerializer(many=True, read_only=True)
    
    class Meta:
        model = SharedJournal
        fields = ('id', 'name', 'description', 'created_by', 'members', 'members_count', 'entries', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members.count()


class SharedJournalListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedJournal
        fields = ('id', 'name', 'description', 'created_by', 'members_count', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members.count()


class PromptResponseSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = PromptResponse
        fields = ('id', 'session', 'author', 'response', 'created_at')
        read_only_fields = ('created_at',)


class SharedPromptSessionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    prompt = JournalPromptSerializer(read_only=True)
    responses = PromptResponseSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedPromptSession
        fields = ('id', 'prompt', 'created_by', 'members', 'members_count', 'title', 'responses', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members.count()


class SharedPromptSessionListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    prompt = JournalPromptSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    response_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedPromptSession
        fields = ('id', 'prompt', 'created_by', 'members_count', 'response_count', 'title', 'created_at', 'updated_at')
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_response_count(self, obj):
        return obj.promptresponse_set.count()


class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = DirectMessage
        fields = ('id', 'sender', 'recipient', 'content', 'image', 'created_at', 'read')
        read_only_fields = ('id', 'sender', 'created_at')


class FriendshipSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ('id', 'user1', 'user2', 'created_at')
        read_only_fields = ('id', 'created_at')
