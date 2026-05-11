using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HcmcRainVision.Backend.Models.Entities
{
    [Table("camera_streams")]
    public class CameraStream
    {
        [Key]
        public Guid StreamId { get; set; } = Guid.NewGuid();

        public string CameraId { get; set; } = null!;
        [ForeignKey("CameraId")]
        public Camera Camera { get; set; } = null!;

        [Required]
        public string StreamUrl { get; set; } = null!;

        public string StreamType { get; set; } = "Snapshot";
        public bool IsPrimary { get; set; } = true;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("camera_status_logs")]
    public class CameraStatusLog
    {
        [Key]
        public Guid StatusLogId { get; set; } = Guid.NewGuid();

        public string CameraId { get; set; } = null!;
        [ForeignKey("CameraId")]
        public Camera Camera { get; set; } = null!;

        public string Status { get; set; } = "Online";
        public string? Reason { get; set; }
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    }
}
