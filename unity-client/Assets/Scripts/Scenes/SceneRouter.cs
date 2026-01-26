using UnityEngine;
using UnityEngine.SceneManagement;

namespace UnityClient.Scenes
{
    public class SceneRouter : MonoBehaviour
    {
        public void Load(string sceneName)
        {
            if (!string.IsNullOrEmpty(sceneName))
            {
                SceneManager.LoadScene(sceneName);
            }
        }

        public void LoadLoading()
        {
            Load("Loading");
        }

        public void LoadLogin()
        {
            Load("Login");
        }

        public void LoadLobby()
        {
            Load("Lobby");
        }

        public void LoadGameplay()
        {
            Load("Gameplay");
        }
    }
}

