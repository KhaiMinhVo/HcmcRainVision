using System.ComponentModel.DataAnnotations;

namespace HcmcRainVision.Backend.Models.DTOs
{
    // DTO dùng khi người dùng muốn đăng ký mới
    public class CreateSubscriptionDto
    {
        [Required]
        public string WardId { get; set; } = null!; // VD: "BN_Q1"

        [Range(0, 1)]
        public float ThresholdProbability { get; set; } = 0.7f; // Mặc định 70%
    }

    // DTO dùng khi người dùng muốn sửa (Bật/Tắt hoặc đổi độ nhạy)
    public class UpdateSubscriptionDto
    {
        [Range(0, 1)]
        public float ThresholdProbability { get; set; }
        
        public bool IsEnabled { get; set; }
    }

    // DTO trả về cho Client hiển thị danh sách
    public class AlertSubscriptionResponseDto
    {
        public Guid SubscriptionId { get; set; }
        public string WardId { get; set; } = null!;
        public string WardName { get; set; } = null!;    // VD: "Phường Bến Nghé"
        public string? DistrictName { get; set; }        // VD: "Quận 1"
        public float ThresholdProbability { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
