import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Plant(models.Model):
    """Reference/template for seed types"""
    id = models.CharField(max_length=50, primary_key=True)  # "sunflower", "rose"
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10)
    description = models.TextField()
    duration_days = models.IntegerField()  # 7, 12, 14
    base_growth_rate = models.FloatField()  # 0.14 (14%), 0.08 (8%), etc.
    difficulty = models.CharField(
        max_length=20,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class SharedGarden(models.Model):
    """Co-growing session between two users"""
    STATUS_CHOICES = [
        ('pending', 'Pending Acceptance'),
        ('active', 'Active'),
        ('bloomed', 'Bloomed'),
        ('abandoned', 'Abandoned'),
        ('archived', 'Archived'),
    ]

    id = models.CharField(
        max_length=36,
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gardens_created'
    )
    user_b = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gardens_joined'
    )
    plant = models.ForeignKey(Plant, on_delete=models.PROTECT)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    both_planted_at = models.DateTimeField(null=True, blank=True)

    invitation_message = models.TextField(blank=True, default='')
    invitation_expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_a', 'status']),
            models.Index(fields=['user_b', 'status']),
        ]

    def __str__(self):
        return f"{self.user_a.username} + {self.user_b.username} - {self.plant.name}"


class GrowthState(models.Model):
    """Current progression of a garden"""
    HEALTH_CHOICES = [
        ('thriving', 'Thriving'),
        ('healthy', 'Healthy'),
        ('declining', 'Declining'),
        ('wilting', 'Wilting'),
        ('dead', 'Dead'),
    ]

    garden = models.OneToOneField(
        SharedGarden,
        on_delete=models.CASCADE,
        related_name='growth_state'
    )

    # Stage progression (1-5)
    current_stage = models.IntegerField(default=1)
    stage_started_at = models.DateTimeField(auto_now_add=True)

    # Growth percentage (0.0 - 100.0)
    growth_percentage = models.FloatField(default=0.0)
    growth_updated_at = models.DateTimeField(auto_now_add=True)

    # Streak tracking
    current_streak_days = models.IntegerField(default=0)
    streak_started_at = models.DateTimeField(null=True, blank=True)
    all_time_max_streak = models.IntegerField(default=0)

    # Health & visual state
    health_status = models.CharField(
        max_length=20,
        choices=HEALTH_CHOICES,
        default='healthy'
    )
    last_care_action_at = models.DateTimeField(null=True, blank=True)
    days_since_last_care = models.IntegerField(default=0)

    # Bloom state
    is_bloomed = models.BooleanField(default=False)
    bloom_type = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Not Yet'),
            ('perfect', 'Perfect'),
            ('partial', 'Partial'),
            ('auto_complete', 'Auto-Completed'),
        ],
        default='pending'
    )
    bloom_timestamp = models.DateTimeField(null=True, blank=True)
    bloomed_at_streak = models.IntegerField(default=0)
    final_care_score = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.garden.id} - {self.growth_percentage}% ({self.current_stage}/5)"


class CareAction(models.Model):
    """Append-only log of care events"""
    ACTION_TYPES = [
        ('water', 'Water'),
        ('meditation', 'Meditation'),
        ('message', 'Message'),
    ]

    id = models.CharField(
        max_length=36,
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    garden = models.ForeignKey(
        SharedGarden,
        on_delete=models.CASCADE,
        related_name='care_actions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='care_actions'
    )

    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)

    points_earned = models.IntegerField(default=0)
    growth_delta = models.FloatField(default=0.0)
    is_synchronized = models.BooleanField(default=False)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['garden', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action_type} @ {self.timestamp}"
