using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HcmcRainVision.Backend.Models.Entities
{
    public class UserReport
    {
        [Key]
        public int Id { get; set; }
        public string CameraId { get; set; } = null!;
        public bool UserClaimIsRaining { get; set; } // Người dùng bảo: Có mưa (True) / Không mưa (False)
        public DateTime Timestamp { get; set; }
        public string? Note { get; set; } // Ghi chú thêm

        // Liên kết với User (Nullable vì có thể mở cho khách vãng lai nếu muốn, nhưng ở đây ta bắt buộc login)
        public int? UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Đánh dấu True nếu hệ thống xác nhận user đang gần camera tại thời điểm báo cáo
        public bool IsVerifiedByLocation { get; set; } = false;

        // Đánh dấu True nếu báo cáo đủ tin cậy để đưa vào luồng retrain AI
        public bool IsFlaggedForRetrain { get; set; } = false;
    }
}
