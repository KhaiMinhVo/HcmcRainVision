namespace HcmcRainVision.Backend.Models.DTOs
{
    public class RoutePointDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

    public class CheckRouteRequest
    {
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
        public double? OriginLatitude { get; set; }
        public double? OriginLongitude { get; set; }
        public double? DestinationLatitude { get; set; }
        public double? DestinationLongitude { get; set; }
        public List<RoutePointDto> RoutePoints { get; set; } = new();
    }

    public class DistrictRainResult
    {
        public string DistrictName { get; set; } = string.Empty;
        public int TotalCameras { get; set; }
        public int RainingCameras { get; set; }
        public double RainRatio { get; set; }
        public string Level { get; set; } = "no_data";
        public DateTime ObservedAtUtc { get; set; }
    }

    public class RouteRainResult
    {
        public bool IsSafe { get; set; }
        public double RiskScore { get; set; }
        public double RainyPointRatio { get; set; }
        public double AverageRainIntensity { get; set; }
        public double PeakRainIntensity { get; set; }
        public int SamplePointCount { get; set; }
        public int RainyPointCount { get; set; }
        public List<object> Warnings { get; set; } = new();
        public string? ModeUsed { get; set; }
        public bool HasExplicitOrigin { get; set; }
        public bool HasExplicitDestination { get; set; }
        public bool HasCurrentGpsOrigin { get; set; }
    }
}
