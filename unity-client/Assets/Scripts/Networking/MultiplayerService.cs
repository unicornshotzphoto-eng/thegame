using System;
using System.Collections;

namespace UnityClient.Networking
{
    public class MultiplayerService
    {
        private readonly ApiClient _api;

        public MultiplayerService(ApiClient api)
        {
            _api = api;
        }

        public IEnumerator CreateGame(string categoryId, string[] playerIds, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new MultiplayerCreatePayload
            {
                category_id = categoryId,
                player_ids = playerIds
            };
            return _api.Post(ApiRoutes.MultiplayerCreate, payload, onSuccess, onError);
        }

        public IEnumerator StartRound(string gameId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Post(ApiRoutes.MultiplayerStartRound(gameId), new EmptyPayload(), onSuccess, onError);
        }

        public IEnumerator SubmitAnswer(string gameId, string answer, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new MultiplayerAnswerPayload
            {
                answer = answer
            };
            return _api.Post(ApiRoutes.MultiplayerSubmitAnswer(gameId), payload, onSuccess, onError);
        }

        public IEnumerator GetAnswers(string gameId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.MultiplayerAnswers(gameId), onSuccess, onError);
        }

        public IEnumerator NextRound(string gameId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Post(ApiRoutes.MultiplayerNextRound(gameId), new EmptyPayload(), onSuccess, onError);
        }

        public IEnumerator EndGame(string gameId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Post(ApiRoutes.MultiplayerEnd(gameId), new EmptyPayload(), onSuccess, onError);
        }

        [Serializable]
        private class MultiplayerCreatePayload
        {
            public string category_id;
            public string[] player_ids;
        }

        [Serializable]
        private class MultiplayerAnswerPayload
        {
            public string answer;
        }

        [Serializable]
        private class EmptyPayload
        {
        }
    }
}

