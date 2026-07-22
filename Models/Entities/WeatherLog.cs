using System.ComponentModel.DataAnnotations;
using NetTopologySuite.Geometries; // Thư viện xử lý bản đồ

namespace HcmcRainVision.Backend.Models.Entities
{
    public class WeatherLog
    {
        [Key]
        public int Id { get; set; }

        public string? CameraId { get; set; } // Ví dụ: "CAM_Q1_001"

        /// <summary>
        /// DENORMALIZATION: Vị trí được lưu sẵn trong Log (trùng với Camera.Latitude/Longitude)
        /// Lý do giữ lại: Tối ưu hiệu năng query GIS (không cần JOIN Camera)
        /// Lợi ích: Nếu dời camera, các Log cũ vẫn giữ vị trí cũ (đúng cho lịch sử)
        /// </summary>
        public Point? Location { get; set; } 

        /// <summary>Kết quả cuối đã được xác nhận bằng voting theo thời gian.</summary>
        public bool IsRaining { get; set; }

        /// <summary>Confidence của prediction thô mới nhất; không phải cường độ mưa.</summary>
        public float Confidence { get; set; }

        /// <summary>Prediction trực tiếp từ model trước khi temporal voting.</summary>
        public bool RawIsRaining { get; set; }

        public float RawConfidence { get; set; }

        public DateTime Timestamp { get; set; } // Thời điểm ghi nhận

        // Lưu đường dẫn ảnh tương đối (VD: /images/rain_logs/cam1_123.jpg)
        public string? ImageUrl { get; set; }
    }
}
