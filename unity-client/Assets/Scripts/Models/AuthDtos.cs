using System;

namespace UnityClient.Models
{
    [Serializable]
    public class UserProfile
    {
        public int id;
        public string username;
        public string email;
        public string thumbnail;
    }

    [Serializable]
    public class SignInRequest
    {
        public string username;
        public string password;
    }

    [Serializable]
    public class SignUpRequest
    {
        public string username;
        public string email;
        public string password;
    }

    [Serializable]
    public class AuthResponse
    {
        public UserProfile user;
        public string access;
        public string token;

        public string AccessToken => !string.IsNullOrEmpty(access) ? access : token;
    }
}

