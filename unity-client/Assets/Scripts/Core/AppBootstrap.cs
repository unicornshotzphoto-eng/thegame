using UnityEngine;
using UnityClient.Networking;
using UnityClient.State;

namespace UnityClient.Core
{
    public class AppBootstrap : MonoBehaviour
    {
        [SerializeField]
        private bool dontDestroyOnLoad = true;

        private void Awake()
        {
            if (dontDestroyOnLoad)
            {
                DontDestroyOnLoad(gameObject);
            }

            var appState = new AppState();
            var apiClient = new ApiClient(GameConfig.ApiBaseUrl, () => appState.AuthToken);

            ServiceLocator.Register(appState);
            ServiceLocator.Register(apiClient);
            ServiceLocator.Register(new AuthService(apiClient, appState));
            ServiceLocator.Register(new SocialService(apiClient));
            ServiceLocator.Register(new QuizService(apiClient));
            ServiceLocator.Register(new CalendarService(apiClient));
            ServiceLocator.Register(new MultiplayerService(apiClient));
        }
    }
}

