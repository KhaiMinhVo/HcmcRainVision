using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Models.Entities;
using System.Text.RegularExpressions; // [Quan trọng] Thêm thư viện này để xử lý chuỗi

namespace HcmcRainVision.Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Khai báo các bảng (DbSet)
        public DbSet<WeatherLog> WeatherLogs { get; set; }
        public DbSet<Camera> Cameras { get; set; }
        public DbSet<UserReport> UserReports { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<FavoriteCamera> FavoriteCameras { get; set; }
        
        // Bảng mới (Chỉ có Ward, bỏ District)
        public DbSet<Ward> Wards { get; set; } 
        public DbSet<CameraStream> CameraStreams { get; set; }
        public DbSet<CameraStatusLog> CameraStatusLogs { get; set; }
        public DbSet<IngestionJob> IngestionJobs { get; set; }
        public DbSet<IngestionAttempt> IngestionAttempts { get; set; }
        public DbSet<AlertSubscription> AlertSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. Cấu hình PostGIS
            modelBuilder.HasPostgresExtension("postgis");
            
            // 2. Các ràng buộc (Constraints) & Index
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            
            // Cấu hình Camera -> Ward
            modelBuilder.Entity<Camera>()
                .HasOne(c => c.Ward)
                .WithMany()
                .HasForeignKey(c => c.WardId)
                .OnDelete(DeleteBehavior.SetNull);

            // =========================================================================
            // 🚀 TỐI ƯU DATABASE INDEX
            // =========================================================================
            // Index cho query lấy log mới nhất theo thời gian
            modelBuilder.Entity<WeatherLog>()
                .HasIndex(x => x.Timestamp)
                .HasDatabaseName("ix_weather_logs_timestamp");

            // Index tổng hợp cho query theo camera và thời gian (composite index)
            modelBuilder.Entity<WeatherLog>()
                .HasIndex(x => new { x.CameraId, x.Timestamp })
                .HasDatabaseName("ix_weather_logs_camera_timestamp");

            // Index cho IngestionAttempt query performance
            modelBuilder.Entity<IngestionAttempt>()
                .HasIndex(x => x.AttemptAt)
                .HasDatabaseName("ix_ingestion_attempts_attempt_at");

            base.OnModelCreating(modelBuilder);

            // =========================================================================
            // 🚀 TỰ ĐỘNG CHUYỂN ĐỔI TÊN THÀNH SNAKE_CASE (ĐỒNG BỘ VỚI ERD)
            // =========================================================================
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // 1. Chuyển tên bảng
                // Ví dụ: "WeatherLog" -> "weather_log"
                var currentTableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(currentTableName))
                {
                    entity.SetTableName(ToSnakeCase(currentTableName));
                }

                // 2. Chuyển tên cột thành snake_case
                // Ví dụ: "IsRaining" -> "is_raining", "CameraId" -> "camera_id"
                foreach (var property in entity.GetProperties())
                {
                    // Chỉ đổi tên những cột chưa được cấu hình tên cụ thể
                    var storeObjectIdentifier = Microsoft.EntityFrameworkCore.Metadata.StoreObjectIdentifier.Table(currentTableName!, entity.GetSchema());
                    var currentColumnName = property.GetColumnName(storeObjectIdentifier);
                    
                    if (!string.IsNullOrEmpty(currentColumnName))
                    {
                        property.SetColumnName(ToSnakeCase(currentColumnName));
                    }
                }

                // 3. Chuyển tên khóa chính/khóa ngoại (Optional: để DB nhìn đẹp hơn)
                foreach (var key in entity.GetKeys())
                {
                    key.SetName(ToSnakeCase(key.GetName()));
                }
                foreach (var key in entity.GetForeignKeys())
                {
                    key.SetConstraintName(ToSnakeCase(key.GetConstraintName()));
                }
                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()));
                }
            }
        }

        // Hàm hỗ trợ chuyển đổi chuỗi: "PascalCase" -> "snake_case"
        private static string ToSnakeCase(string? input)
        {
            if (string.IsNullOrEmpty(input)) return input ?? "";
            
            // Dùng Regex để tìm các ký tự viết hoa và thêm dấu gạch dưới phía trước
            var startUnderscores = Regex.Match(input, @"^_+");
            return startUnderscores + Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLower();
        }
    }
}
