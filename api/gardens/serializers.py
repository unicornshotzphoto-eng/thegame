from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Plant, SharedGarden, GrowthState, CareAction
from quiz.models import User


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ['id', 'name', 'emoji', 'description', 'duration_days', 'base_growth_rate', 'difficulty']


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class GrowthStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthState
        fields = [
            'current_stage',
            'growth_percentage',
            'current_streak_days',
            'is_bloomed',
            'bloom_type',
            'health_status',
            'all_time_max_streak',
        ]


class CareActionSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = CareAction
        fields = ['id', 'user', 'action_type', 'timestamp', 'points_earned']


class SharedGardenSerializer(serializers.ModelSerializer):
    user_a = UserMinimalSerializer(read_only=True)
    user_b = UserMinimalSerializer(read_only=True)
    plant = PlantSerializer(read_only=True)
    growth_state = GrowthStateSerializer(read_only=True)
    plant_id = serializers.CharField(write_only=True)
    user_b_id = serializers.IntegerField(write_only=True)
    is_user_b = serializers.SerializerMethodField()
    user_a_username = serializers.CharField(source='user_a.username', read_only=True)
    user_b_username = serializers.CharField(source='user_b.username', read_only=True)

    class Meta:
        model = SharedGarden
        fields = [
            'id',
            'user_a',
            'user_b',
            'user_a_username',
            'user_b_username',
            'plant',
            'growth_state',
            'status',
            'created_at',
            'accepted_at',
            'invitation_message',
            'plant_id',
            'user_b_id',
            'is_user_b',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'accepted_at', 'growth_state']

    def get_is_user_b(self, obj):
        """Check if the current user is user_b (the invited party)"""
        request = self.context.get('request')
        if request and request.user:
            return obj.user_b_id == request.user.id
        return False

    def create(self, validated_data):
        plant_id = validated_data.pop('plant_id')
        user_b_id = validated_data.pop('user_b_id')

        try:
            plant = Plant.objects.get(id=plant_id)
            user_b = User.objects.get(id=user_b_id)
        except (Plant.DoesNotExist, User.DoesNotExist):
            raise serializers.ValidationError("Invalid plant or user")

        # Check user is not inviting self
        if user_b == validated_data.get('user_a'):
            raise serializers.ValidationError("Cannot invite yourself")

        # Check no active garden exists with this partner
        existing = SharedGarden.objects.filter(
            Q(user_a=validated_data['user_a'], user_b=user_b, status='active') |
            Q(user_a=user_b, user_b=validated_data['user_a'], status='active')
        ).exists()

        if existing:
            raise serializers.ValidationError("Active garden already exists with this partner")

        garden = SharedGarden.objects.create(
            plant=plant,
            user_b=user_b,
            invitation_expires_at=timezone.now() + timedelta(days=7),
            **validated_data
        )
        return garden


class SharedGardenDetailSerializer(SharedGardenSerializer):
    """Extended serializer with care history for detail view"""
    care_actions = serializers.SerializerMethodField()

    class Meta(SharedGardenSerializer.Meta):
        fields = SharedGardenSerializer.Meta.fields + ['care_actions']

    def get_care_actions(self, obj):
        actions = obj.care_actions.all()[:20]
        return CareActionSerializer(actions, many=True).data
