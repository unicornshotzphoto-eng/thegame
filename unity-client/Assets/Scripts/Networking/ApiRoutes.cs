namespace UnityClient.Networking
{
    public static class ApiRoutes
    {
        public const string SignIn = "quiz/signin/";
        public const string SignUp = "quiz/signup/";

        public const string Friends = "quiz/friends/";
        public const string FriendRequests = "quiz/friends/requests/";
        public const string SendFriendRequest = "quiz/friends/request/send/";
        public static string RespondFriendRequest(string requestId) => $"quiz/friends/request/{requestId}/respond/";
        public static string SearchUsers(string query) => $"quiz/search/users/?q={query}";

        public const string QuestionCategories = "quiz/questions/categories/";
        public static string QuestionsByCategory(string category) => $"quiz/questions/{category}/";
        public static string QuestionsByCategoryQuery(string category) => $"quiz/questions/?category={category}";
        public const string QuestionResponses = "quiz/questions/responses/";
        public const string SubmitQuestionAnswer = "quiz/questions/answer/";

        public const string GameCreate = "quiz/game/create/";
        public const string GameActive = "quiz/game/active/";
        public static string GameSession(string sessionId) => $"quiz/game/{sessionId}/";
        public static string DeleteGameSession(string sessionId) => $"quiz/game/{sessionId}/delete/";
        public const string RandomQuestion = "quiz/game/random-question/";
        public const string SubmitGameAnswer = "quiz/game/answer/";

        public const string Groups = "quiz/groups/";
        public const string GroupsCreate = "quiz/groups/create/";
        public static string GroupMessages(string groupId) => $"quiz/groups/{groupId}/messages/";

        public const string Calendars = "quiz/calendars/";
        public static string Calendar(string calendarId) => $"quiz/calendars/{calendarId}/";
        public static string CalendarEvents(string calendarId) => $"quiz/calendars/{calendarId}/events/";
        public static string CalendarEvent(string calendarId, string eventId) => $"quiz/calendars/{calendarId}/events/{eventId}/";
        public static string CalendarInvite(string calendarId) => $"quiz/calendars/{calendarId}/invite/";
        public const string Journals = "quiz/journals/";

        public const string MultiplayerCreate = "api/games/create/";
        public static string MultiplayerStartRound(string gameId) => $"api/games/{gameId}/start-round/";
        public static string MultiplayerSubmitAnswer(string gameId) => $"api/games/{gameId}/submit-answer/";
        public static string MultiplayerAnswers(string gameId) => $"api/games/{gameId}/answers/";
        public static string MultiplayerNextRound(string gameId) => $"api/games/{gameId}/next-round/";
        public static string MultiplayerEnd(string gameId) => $"api/games/{gameId}/end/";
    }
}

