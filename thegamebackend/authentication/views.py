from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from .forms import LoginForm
from .forms import ProfileForm

# Create your views here.
@login_required
def profile_view(request):
    return render(request, 'authentication/templates/profile.html', {'user': request.user})

def upload_profile_picture(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            return redirect('profile')  # Redirect to a profile page or any other page
    else:
        form = ProfileForm(instance=request.user.profile)

    return render(request, 'upload_picture.html', {'form': form})

def login_page(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('profile')  # Redirect to your desired page after login
            else:
                form.add_error(None, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, 'authentication/templates/login.html', {'form': form})