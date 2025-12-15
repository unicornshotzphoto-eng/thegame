from django.urls import path
from .views import (
    SigninView, 
    SignupView, 
    UpdateProfilePictureView, 
    SearchUsersView,
    SendFriendRequestView,
    RespondFriendRequestView,
    FriendsListView,
    PendingRequestsView,
    CreateGroupChatView,
    GroupChatListView,
    GroupChatDetailView,
    GroupMessagesView,
    AddGroupMembersView
)

urlpatterns = [
    path('signin/', SigninView.as_view(), name='signin'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('profile/picture/', UpdateProfilePictureView.as_view(), name='update-profile-picture'),
    path('search/users/', SearchUsersView.as_view(), name='search-users'),
    path('friends/request/send/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('friends/request/<int:request_id>/respond/', RespondFriendRequestView.as_view(), name='respond-friend-request'),
    path('friends/', FriendsListView.as_view(), name='friends-list'),
    path('friends/requests/', PendingRequestsView.as_view(), name='pending-requests'),
    path('groups/create/', CreateGroupChatView.as_view(), name='create-group'),
    path('groups/', GroupChatListView.as_view(), name='group-list'),
    path('groups/<int:group_id>/', GroupChatDetailView.as_view(), name='group-detail'),
    path('groups/<int:group_id>/messages/', GroupMessagesView.as_view(), name='group-messages'),
    path('groups/<int:group_id>/add-members/', AddGroupMembersView.as_view(), name='add-group-members'),
]