namespace HcmcRainVision.Backend.Services.AI
{
    /// <summary>
    /// Fallback an toàn khi model không khả dụng. Không phát sinh dự đoán giả.
    /// </summary>
    public sealed class UnavailableRainPredictionService : IRainPredictionService
    {
        private readonly ILogger<UnavailableRainPredictionService> _logger;

        public UnavailableRainPredictionService(ILogger<UnavailableRainPredictionService> logger)
        {
            _logger = logger;
            _logger.LogError("AI model không khả dụng. Dự đoán mưa đã được tạm dừng.");
        }

        public RainPredictionResult Predict(byte[] imageBytes) => new()
        {
            IsAvailable = false,
            IsRaining = false,
            Confidence = 0,
            Message = "Error: AI model unavailable",
        };
    }
}
