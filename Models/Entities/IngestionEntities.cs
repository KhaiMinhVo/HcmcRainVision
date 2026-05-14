using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HcmcRainVision.Backend.Models.Enums;
using HcmcRainVision.Backend.Models.Constants;

namespace HcmcRainVision.Backend.Models.Entities
{
    [Table("ingestion_jobs")]
    public class IngestionJob
    {
        [Key]
        public Guid JobId { get; set; } = Guid.NewGuid();
        public string JobType { get; set; } = AppConstants.JobTypes.RainScan;
        public string Status { get; set; } = nameof(JobStatus.Running);
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }
        public string? Notes { get; set; }

        public ICollection<IngestionAttempt> Attempts { get; set; } = new List<IngestionAttempt>();
    }

    [Table("ingestion_attempts")]
    public class IngestionAttempt
    {
        [Key]
        public Guid AttemptId { get; set; } = Guid.NewGuid();

        public Guid JobId { get; set; }
        [ForeignKey("JobId")]
        public IngestionJob Job { get; set; } = null!;

        public string? CameraId { get; set; }
        public string Status { get; set; } = nameof(AttemptStatus.Success);
        public int LatencyMs { get; set; }
        public int HttpStatus { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime AttemptAt { get; set; } = DateTime.UtcNow;
    }
}
