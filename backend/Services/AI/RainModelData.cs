using Microsoft.ML.Data;

namespace HcmcRainVision.Backend.Services.AI
{
    // Dữ liệu đầu vào: Đường dẫn ảnh hoặc mảng byte
    public class ModelInput
    {
        [LoadColumn(0)]
        public byte[]? Image { get; set; } // Dữ liệu ảnh dạng raw byte

        [LoadColumn(1)]
        public string? Label { get; set; } // Nhãn (Mưa/Không mưa) - dùng khi train
    }

    // Kết quả dự đoán trả về
    public class ModelOutput
    {
        [ColumnName("PredictedLabel")]
        public string? Prediction { get; set; } // "Rain" hoặc "NoRain"

        [ColumnName("Score")]
        public float[]? Score { get; set; } // Mảng xác suất [0.1, 0.9]
    }
    
    // Class DTO đơn giản để trả về cho Worker dùng
    public class RainPredictionResult
    {
        public bool IsRaining { get; set; }
        public float Confidence { get; set; } // 0 -> 100%
        public string? Message { get; set; }
    }
}