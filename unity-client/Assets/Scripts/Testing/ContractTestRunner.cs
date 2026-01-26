using System;
using System.Collections;
using UnityEngine;
using UnityClient.Core;
using UnityClient.Networking;
using UnityClient.State;

namespace UnityClient.Testing
{
    public class ContractTestRunner : MonoBehaviour
    {
        [Header("Auth")]
        [SerializeField] private string username;
        [SerializeField] private string password;

        [Header("Execution")]
        [SerializeField] private bool runOnStart = true;
        [SerializeField] private float delayBetweenTestsSeconds = 0.25f;

        private ApiClient _api;
        private AuthService _authService;
        private AppState _appState;

        private void Awake()
        {
            _api = ServiceLocator.Resolve<ApiClient>();
            _authService = ServiceLocator.Resolve<AuthService>();
            _appState = ServiceLocator.Resolve<AppState>();
        }

        private void Start()
        {
            if (runOnStart)
            {
                StartCoroutine(RunAll());
            }
        }

        public IEnumerator RunAll()
        {
            if (_api == null || _authService == null || _appState == null)
            {
                Debug.LogError("ContractTestRunner missing services. Ensure AppBootstrap exists.");
                yield break;
            }

            yield return SignIn();
            if (!_appState.IsSignedIn)
            {
                Debug.LogError("Sign-in failed. Aborting contract tests.");
                yield break;
            }

            yield return Get("Question categories", ApiRoutes.QuestionCategories, "categories");
            yield return Get("Friends list", ApiRoutes.Friends, "friends");
            yield return Get("Calendars", ApiRoutes.Calendars, "calendars");
            yield return Get("Journals", ApiRoutes.Journals, "journals");
        }

        private IEnumerator SignIn()
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                Debug.LogError("Username/password required for contract tests.");
                yield break;
            }

            bool done = false;
            ApiError error = null;

            yield return StartCoroutine(_authService.SignIn(username, password, _ =>
            {
                done = true;
            }, err =>
            {
                error = err;
                done = true;
            }));

            if (!done || error != null)
            {
                Debug.LogError($"[FAIL] Sign-in: {FormatError(error)}");
            }
            else
            {
                Debug.Log("[PASS] Sign-in");
            }

            yield return new WaitForSeconds(delayBetweenTestsSeconds);
        }

        private IEnumerator Get(string name, string path, params string[] expectedKeys)
        {
            yield return RunTest(name, (onSuccess, onError) => _api.Get(path, onSuccess, onError),
                json => ContainsAllKeys(json, expectedKeys));
        }

        private IEnumerator RunTest(string name, Func<Action<string>, Action<ApiError>, IEnumerator> request, Func<string, bool> validator)
        {
            bool done = false;
            string response = null;
            ApiError error = null;

            yield return StartCoroutine(request(json =>
            {
                response = json;
                done = true;
            }, err =>
            {
                error = err;
                done = true;
            }));

            if (!done || error != null)
            {
                Debug.LogError($"[FAIL] {name}: {FormatError(error)}");
            }
            else if (validator != null && !validator(response))
            {
                Debug.LogError($"[FAIL] {name}: response missing expected keys");
            }
            else
            {
                Debug.Log($"[PASS] {name}");
            }

            yield return new WaitForSeconds(delayBetweenTestsSeconds);
        }

        private static bool ContainsAllKeys(string json, string[] keys)
        {
            if (string.IsNullOrEmpty(json) || keys == null || keys.Length == 0)
            {
                return true;
            }

            foreach (var key in keys)
            {
                if (!json.Contains($"\"{key}\""))
                {
                    return false;
                }
            }

            return true;
        }

        private static string FormatError(ApiError error)
        {
            if (error == null)
            {
                return "Unknown error";
            }

            return $"HTTP {error.StatusCode} {error.Message} {error.Body}";
        }
    }
}

