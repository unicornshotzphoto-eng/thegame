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
        ('erotic', 'Desirable Knowing (101-160)'),
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
    current_turn_user = models.ForeignKey(User, null=True, blank=True, related_name='current_turn_games', on_delete=models.SET_NULL)
    game_code = models.CharField(max_length=6, unique=True, null=True, blank=True)
    categories = models.ManyToManyField(QuestionCategory, related_name='game_sessions', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
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


class JournalPrompt(models.Model):
    """Journal prompts for connecting with others"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('challenging', 'Challenging'),
    ]
    
    prompt_text = models.TextField()
    category = models.CharField(max_length=50, default='connect')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.prompt_text[:50]}... ({self.difficulty})"

class SharedJournal(models.Model):
    """Shared journal that multiple users can contribute to"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, related_name='created_journals', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='shared_journals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name
    
    def members_count(self):
        return self.members.count()


class JournalEntry(models.Model):
    """Individual entries in a shared journal"""
    journal = models.ForeignKey(SharedJournal, related_name='entries', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name='journal_entries', on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.username} - {self.journal.name}: {self.content[:50]}"


class SharedPromptSession(models.Model):
    """Shared prompt session that multiple users can respond to"""
    prompt = models.ForeignKey(JournalPrompt, related_name='shared_sessions', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name='created_prompt_sessions', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='shared_prompt_sessions')
    title = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Prompt Session: {self.prompt.text[:50]} by {self.created_by.username}"
    
    def members_count(self):
        return self.members.count()


class PromptResponse(models.Model):
    """Individual responses to a shared prompt session"""
    session = models.ForeignKey(SharedPromptSession, related_name='responses', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name='prompt_responses', on_delete=models.CASCADE)
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('session', 'author')
    
    def __str__(self):
        return f"{self.author.username} - {self.session.prompt.text[:50]}"