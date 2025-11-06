from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):  # ✅ Correct base class
    pass

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # ✅ Link to CustomUser
    image = models.ImageField(default='default.jpg', upload_to='profile_pics')
    bio = models.TextField(blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'

