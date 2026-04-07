using System;
using System.Collections;

namespace UnityClient.Networking
{
    public class CalendarService
    {
        private readonly ApiClient _api;

        public CalendarService(ApiClient api)
        {
            _api = api;
        }

        public IEnumerator GetCalendars(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.Calendars, onSuccess, onError);
        }

        public IEnumerator GetCalendar(string calendarId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.Calendar(calendarId), onSuccess, onError);
        }

        public IEnumerator CreateCalendar(string name, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new CreateCalendarPayload
            {
                name = name
            };
            return _api.Post(ApiRoutes.Calendars, payload, onSuccess, onError);
        }

        public IEnumerator InviteFriends(string calendarId, string[] friendIds, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new CalendarInvitePayload
            {
                friend_ids = friendIds
            };
            return _api.Post(ApiRoutes.CalendarInvite(calendarId), payload, onSuccess, onError);
        }

        public IEnumerator CreateEvent(string calendarId, string title, string description, string startDateIso, string endDateIso, string color, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new CreateEventPayload
            {
                title = title,
                description = description,
                start_date = startDateIso,
                end_date = endDateIso,
                color = color
            };
            return _api.Post(ApiRoutes.CalendarEvents(calendarId), payload, onSuccess, onError);
        }

        public IEnumerator DeleteEvent(string calendarId, string eventId, Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Delete(ApiRoutes.CalendarEvent(calendarId, eventId), onSuccess, onError);
        }

        public IEnumerator GetJournals(Action<string> onSuccess, Action<ApiError> onError)
        {
            return _api.Get(ApiRoutes.Journals, onSuccess, onError);
        }

        public IEnumerator CreateJournal(string title, string description, Action<string> onSuccess, Action<ApiError> onError)
        {
            var payload = new CreateJournalPayload
            {
                title = title,
                description = description
            };
            return _api.Post(ApiRoutes.Journals, payload, onSuccess, onError);
        }

        [Serializable]
        private class CreateCalendarPayload
        {
            public string name;
        }

        [Serializable]
        private class CalendarInvitePayload
        {
            public string[] friend_ids;
        }

        [Serializable]
        private class CreateEventPayload
        {
            public string title;
            public string description;
            public string start_date;
            public string end_date;
            public string color;
        }

        [Serializable]
        private class CreateJournalPayload
        {
            public string title;
            public string description;
        }
    }
}

