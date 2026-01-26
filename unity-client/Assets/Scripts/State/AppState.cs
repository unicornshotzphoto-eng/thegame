using System;
using UnityClient.Models;

namespace UnityClient.State
{
    public class AppState
    {
        public string AuthToken { get; private set; }
        public UserProfile CurrentUser { get; private set; }
        public bool IsSignedIn => !string.IsNullOrEmpty(AuthToken);

        public event Action AuthChanged;

        public void SetAuth(string token, UserProfile user)
        {
            AuthToken = token;
            CurrentUser = user;
            AuthChanged?.Invoke();
        }

        public void SignOut()
        {
            AuthToken = null;
            CurrentUser = null;
            AuthChanged?.Invoke();
        }
    }
}

