from rest_framework import serializers
from .models import User, GroupChat, GroupMessage


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