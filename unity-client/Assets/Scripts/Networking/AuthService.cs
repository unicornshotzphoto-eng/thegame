using System;
using System.Collections;
using UnityEngine;
using UnityClient.Models;
using UnityClient.State;

namespace UnityClient.Networking
{
    public class AuthService
    {
        private readonly ApiClient _api;
        private readonly AppState _appState;

        public AuthService(ApiClient api, AppState appState)
        {
            _api = api;
            _appState = appState;
        }

        public IEnumerator SignIn(string username, string password, Action<AuthResponse> onSuccess, Action<ApiError> onError)
        {
            var payload = new SignInRequest
            {
                username = username,
                password = password
            };

            return _api.Post(ApiRoutes.SignIn, payload, json =>
            {
                var response = JsonUtility.FromJson<AuthResponse>(json);
                var token = response != null ? response.AccessToken : null;
                if (!string.IsNullOrEmpty(token))
                {
                    _appState.SetAuth(token, response.user);
                }
                onSuccess?.Invoke(response);
            }, onError);
        }

        public IEnumerator SignUp(string username, string email, string password, Action<AuthResponse> onSuccess, Action<ApiError> onError)
        {
            var payload = new SignUpRequest
            {
                username = username,
                email = email,
                password = password
            };

            return _api.Post(ApiRoutes.SignUp, payload, json =>
            {
                var response = JsonUtility.FromJson<AuthResponse>(json);
                var token = response != null ? response.AccessToken : null;
                if (!string.IsNullOrEmpty(token))
                {
                    _appState.SetAuth(token, response.user);
                }
                onSuccess?.Invoke(response);
            }, onError);
        }
    }
}

