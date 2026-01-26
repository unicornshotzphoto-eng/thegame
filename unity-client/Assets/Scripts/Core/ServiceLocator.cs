using System;
using System.Collections.Generic;

namespace UnityClient.Core
{
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> Services = new Dictionary<Type, object>();

        public static void Register<T>(T service) where T : class
        {
            var type = typeof(T);
            Services[type] = service;
        }

        public static T Resolve<T>() where T : class
        {
            var type = typeof(T);
            if (Services.TryGetValue(type, out var service))
            {
                return service as T;
            }

            return null;
        }

        public static void Clear()
        {
            Services.Clear();
        }
    }
}

