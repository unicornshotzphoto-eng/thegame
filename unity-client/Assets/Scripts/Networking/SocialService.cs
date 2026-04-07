using System;
using System.Collections;

namespace UnityClient.Networking
{
    public class SocialService
    {
        private readonly ApiClient _api;

        public SocialService(ApiClient api)
        {
            _api = api;
        }

        public IEnumerator GetFriends(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.Friends, onSuccess, onError);
        }

        public IEnumerator GetFriendRequests(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.FriendRequests, onSuccess, onError);
        }

        public IEnumerator SendFriendRequest(string userId, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new FriendRequestPayload
            {
                to_user_id = userId
            };
            return _api.Post(ApiRoutes.SendFriendRequest, payload, onSuccess, onError);
        }

        public IEnumerator RespondFriendRequest(string requestId, string action, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new FriendRequestResponsePayload
            {
                action = action
            };
            return _api.Post(ApiRoutes.RespondFriendRequest(requestId), payload, onSuccess, onError);
        }

        public IEnumerator SearchUsers(string query, Action<string> onSuccess, Action<ApiError> onError)
        {
            var encoded = Uri.EscapeDataString(query ?? string.Empty);
            return _api.Get(ApiRoutes.SearchUsers(encoded), onSuccess, onError);
        }

        public IEnumerator GetGroups(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.Groups, onSuccess, onError);
        }

        public IEnumerator CreateGroup(string name, string[] memberIds, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new CreateGroupPayload
            {
                name = name,
                member_ids = memberIds
            };
            return _api.Post(ApiRoutes.GroupsCreate, payload, onSuccess, onError);
        }

        public IEnumerator GetGroupMessages(string groupId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.GroupMessages(groupId), onSuccess, onError);
        }

        public IEnumerator SendGroupMessage(string groupId, string content, string imageBase64, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new GroupMessagePayload
            {
                content = content,
                image = imageBase64
            };
            return _api.Post(ApiRoutes.GroupMessages(groupId), payload, onSuccess, onError);
        }

        [Serializable]
        private class FriendRequestPayload
        {
            public string to_user_id;
        }

        [Serializable]
        private class FriendRequestResponsePayload
        {
            public string action;
        }

        [Serializable]
        private class CreateGroupPayload
        {
            public string name;
            public string[] member_ids;
        }

        [Serializable]
        private class GroupMessagePayload
        {
            public string content;
            public string image;
        }
    }
}

