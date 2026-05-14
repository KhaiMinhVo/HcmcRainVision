namespace HcmcRainVision.Backend.Services.AI
{
    /// <summary>
    /// Mock service cho môi trường development/testing - không cần AI model
    /// </summary>
    public class MockRainPredictionService : IRainPredictionService
    {
        private readonly ILogger<MockRainPredictionService> _logger;

        public MockRainPredictionService(ILogger<MockRainPredictionService> logger)
        {
            _logger = logger;
            _logger.LogWarning("⚠️ Đang sử dụng MockRainPredictionService (không có AI model thật)");
        }

        public RainPredictionResult Predict(byte[] imageBytes)
        {
            // Random kết quả để test giao diện
            var random = new Random();
            bool isRain = random.NextDouble() > 0.5; // 50/50
            
            return new RainPredictionResult
            {
                IsRaining = isRain,
                Confidence = (float)(0.7 + random.NextDouble() * 0.2), // Random từ 70% - 90%
                Message = "[MOCK] Dữ liệu giả lập"
            };
        }
    }
}
