using HcmcRainVision.Backend.Models.DTOs;

namespace HcmcRainVision.Backend.Services.Chatbot
{
    public interface IRoutePlanningService
    {
        Task<List<RoutePointDto>> BuildRouteAsync(string origin, string destination, CancellationToken cancellationToken = default);
    }
}
