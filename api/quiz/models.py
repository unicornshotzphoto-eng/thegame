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