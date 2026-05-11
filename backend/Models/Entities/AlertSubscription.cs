using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace HcmcRainVision.Backend.Models.Entities
{
    [Table("alert_subscriptions")]
    public class AlertSubscription
    {
        [Key]
        public Guid SubscriptionId { get; set; } = Guid.NewGuid();

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // Đăng ký nhận tin theo Phường (Ward)
        public string? WardId { get; set; }
        [ForeignKey("WardId")]
        public Ward? Ward { get; set; }

        public Point? CenterPoint { get; set; } 
        public int? RadiusMeters { get; set; } 

        public float ThresholdProbability { get; set; } = 0.7f;
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
