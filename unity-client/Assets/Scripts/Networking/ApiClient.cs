using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using UnityClient.Core;

namespace UnityClient.Networking
{
    public class ApiClient
    {
        private readonly string _baseUrl;
        private readonly Func<string> _authTokenProvider;

        public ApiClient(string baseUrl, Func<string> authTokenProvider)
        {
            _baseUrl = NormalizeBaseUrl(baseUrl);
            _authTokenProvider = authTokenProvider;
        }

        public IEnumerator Get(string path, Action<string> onSuccess, Action<ApiError> onError)
        {
            var request = UnityWebRequest.Get(ResolveUrl(path));
            request.downloadHandler = new DownloadHandlerBuffer();
            return Send(request, onSuccess, onError);
        }

        public IEnumerator Post<T>(string path, T payload, Action<string> onSuccess, Action<ApiError> onError)
        {
            var url = ResolveUrl(path);
            var json = JsonUtility.ToJson(payload);
            var request = new UnityWebRequest(url, "POST");
            var bodyRaw = Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            return Send(request, onSuccess, onError);
        }

        public IEnumerator Delete(string path, Action<string> onSuccess, Action<ApiError> onError)
        {
            var request = UnityWebRequest.Delete(ResolveUrl(path));
            request.downloadHandler = new DownloadHandlerBuffer();
            return Send(request, onSuccess, onError);
        }

        private IEnumerator Send(UnityWebRequest request, Action<string> onSuccess, Action<ApiError> onError)
        {
            request.timeout = GameConfig.ApiTimeoutSeconds;
            var token = _authTokenProvider != null ? _authTokenProvider() : null;
            if (!string.IsNullOrEmpty(token))
            {
                request.SetRequestHeader("Authorization", $"Bearer {token}");
            }

            if (GameConfig.DebugApi)
            {
                Debug.Log($"API {request.method} {request.url}");
            }

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                var error = new ApiError
                {
                    StatusCode = request.responseCode,
                    Message = request.error,
                    Body = request.downloadHandler != null ? request.downloadHandler.text : null
                };

                if (GameConfig.DebugApi)
                {
                    Debug.LogWarning($"API error {request.responseCode}: {request.error}");
                }

                onError?.Invoke(error);
                yield break;
            }

            onSuccess?.Invoke(request.downloadHandler.text);
        }

        private string ResolveUrl(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return _baseUrl;
            }

            if (path.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                return path;
            }

            if (path.StartsWith("/"))
            {
                path = path.Substring(1);
            }

            return _baseUrl + path;
        }

        private static string NormalizeBaseUrl(string baseUrl)
        {
            if (string.IsNullOrEmpty(baseUrl))
            {
                return "http://localhost:8000/";
            }

            return baseUrl.EndsWith("/") ? baseUrl : baseUrl + "/";
        }
    }

    public class ApiError
    {
        public long StatusCode;
        public string Message;
        public string Body;
    }
}

