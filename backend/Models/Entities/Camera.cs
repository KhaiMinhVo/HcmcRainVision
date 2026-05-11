using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HcmcRainVision.Backend.Models.Enums;

namespace HcmcRainVision.Backend.Models.Entities
{
    public class Camera
    {
        [Key]
        public string Id { get; set; } = null!; 

        public string Name { get; set; } = null!; 
        public double Latitude { get; set; } 
        public double Longitude { get; set; } 

        // --- LIÊN KẾT MỚI ---
        public string? WardId { get; set; }
        
        [ForeignKey("WardId")]
        public Ward? Ward { get; set; }

        public ICollection<CameraStream> Streams { get; set; } = new List<CameraStream>();
        public ICollection<CameraStatusLog> StatusLogs { get; set; } = new List<CameraStatusLog>();

        public string Status { get; set; } = nameof(CameraStatus.Active);

        /// <summary>
        /// MD5 Hash của ảnh cuối cùng để phát hiện camera bị treo (stuck)
        /// </summary>
        public string? LastImageHash { get; set; }

        /// <summary>
        /// Thời điểm camera được hệ thống cập nhật trạng thái/lần quét gần nhất (UTC)
        /// </summary>
        public DateTime? LastUpdatedAt { get; set; }
    }
}
