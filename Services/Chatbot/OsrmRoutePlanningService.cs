using System.Globalization;
using HcmcRainVision.Backend.Models.DTOs;

namespace HcmcRainVision.Backend.Services.Chatbot
{
    public class OsrmRoutePlanningService : IRoutePlanningService
    {
        public Task<List<RoutePointDto>> BuildRouteAsync(string origin, string destination, CancellationToken cancellationToken = default)
        {
            var points = new List<RoutePointDto>();
            if (TryParseLatLng(origin, out var oLat, out var oLng) && TryParseLatLng(destination, out var dLat, out var dLng))
            {
                points.Add(new RoutePointDto { Lat = oLat, Lng = oLng });
                points.Add(new RoutePointDto { Lat = dLat, Lng = dLng });
            }
            return Task.FromResult(points);
        }

        private static bool TryParseLatLng(string input, out double lat, out double lng)
        {
            lat = 0; lng = 0;
            var parts = input.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            return parts.Length == 2
                && double.TryParse(parts[0], CultureInfo.InvariantCulture, out lat)
                && double.TryParse(parts[1], CultureInfo.InvariantCulture, out lng);
        }
    }
}
