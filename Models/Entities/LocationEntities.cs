using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HcmcRainVision.Backend.Models.Entities
{
    [Table("wards")]
    public class Ward
    {
        [Key]
        public string WardId { get; set; } = null!; // VD: "79_001_00001" (Mã phường)

        [Required]
        [MaxLength(100)]
        public string WardName { get; set; } = null!; // VD: "Phường Bến Nghé"

        // Vì đã bỏ bảng District, ta lưu tên Quận trực tiếp vào đây để phân loại
        [MaxLength(100)]
        [Column("cluster_name")]
        public string? DistrictName { get; set; } // VD: "Quận 1"

        [MaxLength(200)]
        public string? Alias { get; set; } // VD: "Gồm P.6, P.7, P.8 cũ"

        /// <summary>
        /// Số cụm thi đua theo QĐ2913 (1-16). Dùng để nhóm khu vực quản lý.
        /// </summary>
        public int? ClusterNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
