using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HcmcRainVision.Backend.Models.Entities;

public sealed class TrainingImageReview
{
    [Key]
    public int Id { get; set; }

    public int WeatherLogId { get; set; }

    [ForeignKey(nameof(WeatherLogId))]
    public WeatherLog WeatherLog { get; set; } = null!;

    [MaxLength(20)]
    public string Label { get; set; } = string.Empty;

    public int? ReviewedByUserId { get; set; }

    [ForeignKey(nameof(ReviewedByUserId))]
    public User? ReviewedByUser { get; set; }

    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
}
