from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
def upload_thumbnail(instance, filename):
    path = f'thumbnails/{instance.username}/{filename}'
    extention = filename.split('.')[-1]
    if extention.lower() not in ['jpg', 'jpeg', 'png', 'gif']:
        raise ValueError('Unsupported file extension.')
    return path

class User(AbstractUser):
    thumbnail = models.ImageField(upload_to=upload_thumbnail, null=True, blank=True)

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('from_user', 'to_user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.from_user.username} -> {self.to_user.username} ({self.status})'

class GroupChat(models.Model):
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, related_name='created_groups', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='group_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name
    
    def member_count(self):
        return self.members.count()

class GroupMessage(models.Model):
    group = models.ForeignKey(GroupChat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='group_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    image = models.TextField(blank=True, null=True)  # Base64 encoded image
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f'{self.sender.username} in {self.group.name}: {self.content[:50]}'

<<<<<<< HEAD

class SharedCalendar(models.Model):
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, related_name='created_calendars', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='shared_calendars')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name
    
    def members_count(self):
        return self.members.count()


class CalendarEvent(models.Model):
    calendar = models.ForeignKey(SharedCalendar, related_name='events', on_delete=models.CASCADE)
    creator = models.ForeignKey(User, related_name='created_events', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    color = models.CharField(max_length=7, default='#1a73e8')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date']
    
    def __str__(self):
        return f'{self.title} ({self.calendar.name})'


class QuestionCategory(models.Model):
    CATEGORIES = [
        ('spiritual', 'Spiritual Knowing (1-20)'),
        ('mental', 'Mental Knowing (21-40)'),
        ('physical', 'Physical Knowing (41-60)'),
        ('disagreeables', 'Disagreeables & Truth Checks (61-80)'),
        ('romantic', 'Romantic Knowing (81-100)'),
        ('erotic', 'Erotic Knowing (101-160)'),
        ('creative', 'Creative & Fun (161-200)'),
    ]
    
    category = models.CharField(max_length=20, choices=CATEGORIES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['category']
    
    def __str__(self):
        return self.name


class Question(models.Model):
    category = models.ForeignKey(QuestionCategory, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    points = models.IntegerField(default=1)
    consequence = models.TextField(help_text="What happens if you refuse to answer")
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.question_text[:50]}... ({self.category.name})"


class GameSession(models.Model):
    """Represents a multiplayer game session"""
    STATUS_CHOICES = [
        ('waiting', 'Waiting for Players'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    creator = models.ForeignKey(User, related_name='created_game_sessions', on_delete=models.CASCADE)
    players = models.ManyToManyField(User, related_name='game_sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    current_round = models.IntegerField(default=1)
    current_question = models.ForeignKey(Question, null=True, blank=True, on_delete=models.SET_NULL)
    category_picker = models.ForeignKey(User, null=True, blank=True, related_name='picked_categories', on_delete=models.SET_NULL)
=======
class Question(models.Model):
    CATEGORY_CHOICES = [
        ('spiritual_knowing', 'Spiritual Knowing'),
        ('mental_knowing', 'Mental Knowing'),
        ('physical_knowing', 'Physical Knowing'),
        ('disagreeables_truth', 'Disagreeables & Truth Checks'),
        ('romantic_knowing', 'Romantic Knowing'),
        ('erotic_knowing', 'Erotic Knowing'),
        ('creative_fun', 'Creative & Fun'),
    ]
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='spiritual_knowing')
    question_number = models.IntegerField()
    question_text = models.TextField()
    points = models.IntegerField(default=2)
    consequence = models.TextField()  # "If wrong" action
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'question_number']
        unique_together = ('category', 'question_number')
    
    def __str__(self):
        return f'{self.category} Q{self.question_number}: {self.question_text[:50]}'

class QuestionResponse(models.Model):
    question = models.ForeignKey(Question, related_name='responses', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='question_responses', on_delete=models.CASCADE)
    partner = models.ForeignKey(User, related_name='received_responses', on_delete=models.CASCADE, null=True, blank=True)
    response_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} answered Q{self.question.question_number}'

class GameSession(models.Model):
    SESSION_TYPE_CHOICES = [
        ('direct', 'Direct (1v1)'),
        ('group', 'Group'),
    ]
    
    session_type = models.CharField(max_length=10, choices=SESSION_TYPE_CHOICES)
    group = models.ForeignKey(GroupChat, related_name='game_sessions', on_delete=models.CASCADE, null=True, blank=True)
    participants = models.ManyToManyField(User, related_name='game_sessions')
    current_turn_user = models.ForeignKey(User, related_name='current_turns', on_delete=models.SET_NULL, null=True, blank=True)
    turn_order = models.JSONField(default=list)  # List of user IDs in turn order
    is_active = models.BooleanField(default=True)
>>>>>>> main
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
<<<<<<< HEAD
        return f"Game #{self.id} - {self.status}"


class PlayerAnswer(models.Model):
    """Stores answers from each player in a game session"""
    game_session = models.ForeignKey(GameSession, related_name='answers', on_delete=models.CASCADE)
    player = models.ForeignKey(User, related_name='game_answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    points_awarded = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('game_session', 'player', 'question')
    
    def __str__(self):
        return f"{self.player.username} - {self.question.question_text[:30]}"
=======
        return f'{self.session_type} session - {self.created_at}'
    
    def next_turn(self):
        """Move to the next player's turn"""
        if not self.turn_order:
            return
        
        current_index = -1
        if self.current_turn_user:
            try:
                current_index = self.turn_order.index(self.current_turn_user.id)
            except ValueError:
                pass
        
        next_index = (current_index + 1) % len(self.turn_order)
        next_user_id = self.turn_order[next_index]
        self.current_turn_user = User.objects.get(id=next_user_id)
        self.save()

class GameRound(models.Model):
    """A round represents one question that all players answer"""
    session = models.ForeignKey(GameSession, related_name='rounds', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name='game_rounds', on_delete=models.CASCADE)
    picker = models.ForeignKey(User, related_name='picked_rounds', on_delete=models.CASCADE)  # Player who picked the category
    picker_answer = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f'Round {self.id} - Q{self.question.question_number} picked by {self.picker.username}'

class GameTurn(models.Model):
    """Each player's answer to a round's question"""
    round = models.ForeignKey(GameRound, related_name='answers', on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(User, related_name='game_turns', on_delete=models.CASCADE)
    answer = models.TextField(blank=True, null=True)
    points_earned = models.IntegerField(default=0)
    answered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        unique_together = ('round', 'player')
    
    def __str__(self):
        return f'{self.player.username} - Round {self.round.id if self.round else "None"}'
>>>>>>> main
