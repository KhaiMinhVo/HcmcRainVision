using System.Collections.Concurrent;
using HcmcRainVision.Backend.Models.DTOs;

namespace HcmcRainVision.Backend.Services.Chatbot
{
    public class RouteMonitoringRegistry
    {
        private readonly ConcurrentDictionary<string, HashSet<string>> _routeConnections = new();

        public void Upsert(string routeId, string connectionId, List<RoutePointDto> routePoints, string? origin, string? destination)
        {
            var set = _routeConnections.GetOrAdd(routeId, _ => new HashSet<string>());
            lock (set)
            {
                set.Add(connectionId);
            }
        }

        public string GetGroupName(string routeId) => $"route:{routeId}";

        public List<string> RemoveConnectionFromAllRoutes(string connectionId)
        {
            var removed = new List<string>();
            foreach (var kvp in _routeConnections)
            {
                lock (kvp.Value)
                {
                    if (kvp.Value.Remove(connectionId))
                    {
                        removed.Add(kvp.Key);
                        if (kvp.Value.Count == 0)
                        {
                            _routeConnections.TryRemove(kvp.Key, out _);
                        }
                    }
                }
            }
            return removed;
        }

        public void RemoveConnectionFromRoute(string routeId, string connectionId)
        {
            if (_routeConnections.TryGetValue(routeId, out var set))
            {
                lock (set)
                {
                    set.Remove(connectionId);
                    if (set.Count == 0)
                    {
                        _routeConnections.TryRemove(routeId, out _);
                    }
                }
            }
        }
    }
}
