using HcmcRainVision.Backend.Models.DTOs;

namespace HcmcRainVision.Backend.Services.Chatbot
{
    public class GoogleMapsRoutePlanningService : IRoutePlanningService
    {
        private readonly OsrmRoutePlanningService _fallback = new();

        public Task<List<RoutePointDto>> BuildRouteAsync(string origin, string destination, CancellationToken cancellationToken = default)
            => _fallback.BuildRouteAsync(origin, destination, cancellationToken);
    }
}
