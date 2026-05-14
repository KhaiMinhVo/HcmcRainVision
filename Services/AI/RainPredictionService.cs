using Microsoft.ML;
using Microsoft.Extensions.ML;

namespace HcmcRainVision.Backend.Services.AI
{
    /// <summary>
    /// Service dự đoán mưa sử dụng ML.NET với PredictionEnginePool (thread-safe)
    /// </summary>
    public class MlRainPredictionService : IRainPredictionService
    {
        private const string ModelName = "RainModel";
        private readonly PredictionEnginePool<ModelInput, ModelOutput> _predictionEnginePool;
        private readonly ILogger<MlRainPredictionService> _logger;

        public MlRainPredictionService(
            PredictionEnginePool<ModelInput, ModelOutput> predictionEnginePool,
            ILogger<MlRainPredictionService> logger)
        {
            _predictionEnginePool = predictionEnginePool;
            _logger = logger;
            _logger.LogInformation("✅ MlRainPredictionService khởi tạo với AI Model");
        }

        public RainPredictionResult Predict(byte[] imageBytes)
        {
            try
            {
                var input = new ModelInput { Image = imageBytes };
                
                // PredictionEnginePool tự xử lý thread-safe
                var result = _predictionEnginePool.Predict(ModelName, input);

                // Giả sử nhãn của bạn là "Rain" và "NoRain"
                bool isRaining = result.Prediction?.Equals("Rain", StringComparison.OrdinalIgnoreCase) ?? false;
                
                // Lấy độ tin cậy cao nhất trong mảng Score
                float maxScore = result.Score?.Max() ?? 0f; 

                return new RainPredictionResult
                {
                    IsRaining = isRaining,
                    Confidence = maxScore,
                    Message = "AI Prediction"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dự đoán với AI Model");
                return new RainPredictionResult 
                { 
                    IsRaining = false, 
                    Confidence = 0, 
                    Message = $"Error: {ex.GetType().Name}" 
                };
            }
        }
    }
}