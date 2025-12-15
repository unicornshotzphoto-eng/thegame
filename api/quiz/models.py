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