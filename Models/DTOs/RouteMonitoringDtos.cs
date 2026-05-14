using System.ComponentModel.DataAnnotations;

namespace HcmcRainVision.Backend.Models.DTOs
{
    public class StartRouteMonitoringRequest
    {
        public string? RouteId { get; set; }
        public string? Origin { get; set; }
        public string? Destination { get; set; }

        [Required]
        [MinLength(2)]
        public List<RoutePointDto> RoutePoints { get; set; } = new();
    }

    public class StopRouteMonitoringRequest
    {
        [Required]
        public string RouteId { get; set; } = string.Empty;
    }
}
