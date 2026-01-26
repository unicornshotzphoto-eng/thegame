using System;
using System.Collections;

namespace UnityClient.Networking
{
    public class QuizService
    {
        private readonly ApiClient _api;

        public QuizService(ApiClient api)
        {
            _api = api;
        }

        public IEnumerator GetQuestionCategories(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.QuestionCategories, onSuccess, onError);
        }

        public IEnumerator GetQuestionsByCategory(string category, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.QuestionsByCategory(category), onSuccess, onError);
        }

        public IEnumerator GetQuestionsByCategoryQuery(string category, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.QuestionsByCategoryQuery(category), onSuccess, onError);
        }

        public IEnumerator GetQuestionResponses(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.QuestionResponses, onSuccess, onError);
        }

        public IEnumerator SubmitQuestionAnswer(int questionId, string answer, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new QuestionAnswerPayload
            {
                question_id = questionId,
                answer = answer
            };
            return _api.Post(ApiRoutes.SubmitQuestionAnswer, payload, onSuccess, onError);
        }

        public IEnumerator CreateGameSession(string sessionType, string groupId, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new GameCreatePayload
            {
                session_type = sessionType,
                group_id = groupId
            };
            return _api.Post(ApiRoutes.GameCreate, payload, onSuccess, onError);
        }

        public IEnumerator GetActiveGames(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.GameActive, onSuccess, onError);
        }

        public IEnumerator GetGameSession(string sessionId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.GameSession(sessionId), onSuccess, onError);
        }

        public IEnumerator GetRandomQuestion(string sessionId, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new RandomQuestionPayload
            {
                session_id = sessionId
            };
            return _api.Post(ApiRoutes.RandomQuestion, payload, onSuccess, onError);
        }

        public IEnumerator SubmitGameAnswer(string sessionId, int questionId, string answer, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new GameAnswerPayload
            {
                session_id = sessionId,
                question_id = questionId,
                answer = answer
            };
            return _api.Post(ApiRoutes.SubmitGameAnswer, payload, onSuccess, onError);
        }

        public IEnumerator DeleteGameSession(string sessionId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Delete(ApiRoutes.DeleteGameSession(sessionId), onSuccess, onError);
        }

        [Serializable]
        private class QuestionAnswerPayload
        {
            public int question_id;
            public string answer;
        }

        [Serializable]
        private class GameCreatePayload
        {
            public string session_type;
            public string group_id;
        }

        [Serializable]
        private class RandomQuestionPayload
        {
            public string session_id;
        }

        [Serializable]
        private class GameAnswerPayload
        {
            public string session_id;
            public int question_id;
            public string answer;
        }
    }
}

