# myapp/forms.py
from django import forms
from .models import Profile

class LoginForm(forms.Form):
    username = forms.CharField(max_length=63)
    password = forms.CharField(widget=forms.PasswordInput) 

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'image']