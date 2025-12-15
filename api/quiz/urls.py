from django.urls import path
from .views import SigninView, SignupView, UpdateProfilePictureView

urlpatterns = [
    path('signin/', SigninView.as_view(), name='signin'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('profile/picture/', UpdateProfilePictureView.as_view(), name='update-profile-picture'),
]