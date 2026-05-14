using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.DTOs;
using HcmcRainVision.Backend.Models.Enums;
using HcmcRainVision.Backend.Models.Constants;

namespace HcmcRainVision.Backend.Controllers
{
    [Authorize(Roles = AppConstants.UserRoles.Admin)] // Chỉ Admin mới vào được
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Thống kê hệ thống
        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            var totalCameras = await _context.Cameras.CountAsync();
            var totalLogs = await _context.WeatherLogs.CountAsync();
            var totalReports = await _context.UserReports.CountAsync();
            
            // Lấy lần quét cuối cùng
            var lastScan = await _context.WeatherLogs
                .OrderByDescending(x => x.Timestamp)
                .Select(x => x.Timestamp)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                TotalCameras = totalCameras,
                TotalWeatherLogs = totalLogs,
                TotalUserReports = totalReports,
                LastSystemScan = lastScan,
                SystemStatus = nameof(JobStatus.Running)
            });
        }

        // 2. Lấy danh sách ảnh cần kiểm tra lại (User báo sai)
        // Logic: Tìm các UserReport, sau đó tìm WeatherLog tương ứng (dựa trên CameraId và thời gian gần nhất)
        [HttpGet("audit-data")]
        public async Task<IActionResult> GetAuditData()
        {
            var reports = await _context.UserReports
                .OrderByDescending(r => r.Timestamp)
                .Take(100) // Lấy 100 báo cáo mới nhất
                .ToListAsync();

            var result = new List<object>();

            foreach (var report in reports)
            {
                // Tìm log của AI trong khoảng +- 5 phút so với lúc user báo cáo (dùng UTC)
                var logsInRange = await _context.WeatherLogs
                    .Where(w => w.CameraId == report.CameraId 
                                && w.Timestamp >= report.Timestamp.AddMinutes(-5)
                                && w.Timestamp <= report.Timestamp.AddMinutes(5))
                    .ToListAsync();
                
                // Sort trong memory vì Math.Abs không dịch được sang SQL
                var relevantLog = logsInRange
                    .OrderBy(w => Math.Abs((w.Timestamp - report.Timestamp).Ticks))
                    .FirstOrDefault();

                if (relevantLog != null)
                {
                    result.Add(new
                    {
                        ReportId = report.Id,
                        CameraId = report.CameraId,
                        UserSaid = report.UserClaimIsRaining ? "Rain" : "No Rain",
                        AISaid = relevantLog.IsRaining ? "Rain" : "No Rain",
                        AIConfidence = relevantLog.Confidence,
                        ImageUrl = relevantLog.ImageUrl, // Ảnh này sẽ dùng để train lại
                        ReportTime = report.Timestamp,
                        Note = report.Note
                    });
                }
            }

            return Ok(result);
        }

        // 3. Quản lý User - Lấy danh sách tất cả user
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? search,
            [FromQuery] string? sortBy = "newest",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Users.AsQueryable();

            // Search theo Email hoặc Username
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.Email.Contains(search) || u.Username.Contains(search));
            }

            // Sort theo ngày tạo (CreatedAt)
            query = sortBy?.ToLower() switch
            {
                "oldest" => query.OrderBy(u => u.CreatedAt),
                "newest" => query.OrderByDescending(u => u.CreatedAt),
                "username" => query.OrderBy(u => u.Username),
                _ => query.OrderByDescending(u => u.CreatedAt)
            };

            var totalUsers = await query.CountAsync();
            var users = await query.Skip((page - 1) * pageSize)
                                   .Take(pageSize)
                                   .Select(u => new UserAdminViewDto
                                   {
                                       Id = u.Id,
                                       Username = u.Username,
                                       Email = u.Email,
                                       FullName = u.FullName,
                                       Role = u.Role,
                                       IsActive = u.IsActive,
                                       CreatedAt = u.CreatedAt
                                   })
                                   .ToListAsync();

            return Ok(new { Total = totalUsers, Page = page, PageSize = pageSize, Data = users });
        }

        // 4. Khóa/Mở khóa tài khoản user
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> ToggleBanUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            
            if (user.Role == "Admin") return BadRequest("Không thể khóa tài khoản Admin!");

            user.IsActive = !user.IsActive; // Đảo ngược trạng thái (Khóa <-> Mở)
            await _context.SaveChangesAsync();

            string status = user.IsActive ? "Đã mở khóa" : "Đã khóa";
            return Ok(new { message = $"{status} tài khoản {user.Username}" });
        }

        // 5. Thống kê tần suất mưa theo giờ
        [HttpGet("stats/rain-frequency")]
        public async Task<IActionResult> GetRainFrequency()
        {
            // Thống kê số lượng bản ghi mưa theo từng giờ trong 7 ngày qua
            var weekAgo = DateTime.UtcNow.AddDays(-7);
            
            var stats = await _context.WeatherLogs
                .Where(x => x.IsRaining && x.Timestamp >= weekAgo)
                .GroupBy(x => x.Timestamp.Hour)
                .Select(g => new { Hour = g.Key, Count = g.Count() })
                .OrderBy(x => x.Hour)
                .ToListAsync();

            return Ok(stats);
        }

        // 6. Lấy danh sách camera lỗi (không có dữ liệu trong 1 giờ qua)
        [HttpGet("stats/failed-cameras")]
        public async Task<IActionResult> GetFailedCameras()
        {
            var oneHourAgo = DateTime.UtcNow.AddHours(-1);
            
            // Lấy danh sách camera có dữ liệu mới
            var activeCameraIds = await _context.WeatherLogs
                .Where(x => x.Timestamp > oneHourAgo)
                .Select(x => x.CameraId)
                .Distinct()
                .ToListAsync();

            // Lấy camera KHÔNG có trong danh sách active
            var failedCameras = await _context.Cameras
                .Include(c => c.Streams)
                .Where(c => !activeCameraIds.Contains(c.Id))
                .Select(c => new {
                    c.Id,
                    c.Name,
                    StreamUrl = c.Streams.FirstOrDefault(s => s.IsPrimary) != null ? c.Streams.FirstOrDefault(s => s.IsPrimary).StreamUrl : "N/A",
                    c.Latitude,
                    c.Longitude,
                    Status = "Offline - Không có dữ liệu mới"
                })
                .ToListAsync();

            return Ok(new {
                TotalFailed = failedCameras.Count,
                Cameras = failedCameras
            });
        }

        // 7. ⚡ Kiểm tra health (sức khỏe) của tất cả camera (TỐI ƯU: Query từ DB thay vì crawl live)
        // Worker đã kiểm tra định kỳ và lưu vào CameraStatusLogs -> API này chỉ cần đọc kết quả
        [HttpGet("stats/check-camera-health")]
        public async Task<IActionResult> CheckCameraHealth()
        {
            // Lấy trạng thái từ DB (cực nhanh < 50ms) thay vì đi crawl lại (50s cho 50 cameras)
            var cameras = await _context.Cameras
                .Include(c => c.Streams)
                .Select(c => new 
                {
                    Id = c.Id,
                    Name = c.Name,
                    CurrentStatus = c.Status,
                    // Lấy log trạng thái mới nhất từ Worker
                    LastLog = _context.CameraStatusLogs
                                .Where(l => l.CameraId == c.Id)
                                .OrderByDescending(l => l.CheckedAt)
                                .FirstOrDefault(),
                    StreamUrl = c.Streams.FirstOrDefault(s => s.IsPrimary).StreamUrl
                })
                .ToListAsync();

            var results = cameras.Select(c => new {
                Id = c.Id,
                Name = c.Name,
                Status = c.CurrentStatus,
                LastChecked = c.LastLog != null ? c.LastLog.CheckedAt : (DateTime?)null,
                Reason = c.LastLog?.Reason,
                StreamUrl = c.StreamUrl == AppConstants.Camera.TestModeUrl ? "Test Mode" : c.StreamUrl
            }).ToList();

            var summary = new {
                TotalCameras = cameras.Count,
                Active = results.Count(r => r.Status == nameof(CameraStatus.Active)),
                Offline = results.Count(r => r.Status == nameof(CameraStatus.Offline)),
                Maintenance = results.Count(r => r.Status == nameof(CameraStatus.Maintenance)),
                TestMode = results.Count(r => r.StreamUrl == "Test Mode"),
                CheckedAt = DateTime.UtcNow,
                Note = "Data from background worker (updates every 5 minutes)"
            };
            
            return Ok(new { Summary = summary, Details = results });
        }

        // 6. Lấy lịch sử Ingestion Jobs (Tracking quét camera)
        [HttpGet("ingestion-jobs")]
        public async Task<IActionResult> GetIngestionJobs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null)
        {
            var query = _context.IngestionJobs
                .Include(j => j.Attempts)
                .AsQueryable();

            // Filter theo status nếu có
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(j => j.Status == status);
            }

            var totalCount = await query.CountAsync();
            
            var jobs = await query
                .OrderByDescending(j => j.StartedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new
                {
                    j.JobId,
                    j.JobType,
                    j.Status,
                    j.StartedAt,
                    j.EndedAt,
                    Duration = j.EndedAt.HasValue 
                        ? (j.EndedAt.Value - j.StartedAt).TotalSeconds 
                        : (double?)null,
                    j.Notes,
                    TotalAttempts = j.Attempts.Count,
                    SuccessfulAttempts = j.Attempts.Count(a => a.Status == nameof(AttemptStatus.Success)),
                    FailedAttempts = j.Attempts.Count(a => a.Status == nameof(AttemptStatus.Failed)),
                    AvgLatency = j.Attempts.Any() 
                        ? j.Attempts.Average(a => a.LatencyMs) 
                        : 0
                })
                .ToListAsync();

            return Ok(new
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                Jobs = jobs
            });
        }

        // 7. Lấy chi tiết một Ingestion Job (bao gồm tất cả attempts)
        [HttpGet("ingestion-jobs/{jobId}")]
        public async Task<IActionResult> GetIngestionJobDetails(Guid jobId)
        {
            var job = await _context.IngestionJobs
                .Include(j => j.Attempts)
                .Where(j => j.JobId == jobId)
                .Select(j => new
                {
                    j.JobId,
                    j.JobType,
                    j.Status,
                    j.StartedAt,
                    j.EndedAt,
                    Duration = j.EndedAt.HasValue 
                        ? (j.EndedAt.Value - j.StartedAt).TotalSeconds 
                        : (double?)null,
                    j.Notes,
                    Attempts = j.Attempts.Select(a => new
                    {
                        a.AttemptId,
                        a.CameraId,
                        a.Status,
                        a.LatencyMs,
                        a.HttpStatus,
                        a.ErrorMessage,
                        a.AttemptAt
                    }).OrderBy(a => a.AttemptAt).ToList()
                })
                .FirstOrDefaultAsync();

            if (job == null)
                return NotFound(new { Message = "Job not found" });

            return Ok(job);
        }

        // 8. Thống kê Ingestion Performance
        [HttpGet("ingestion-stats")]
        public async Task<IActionResult> GetIngestionStats([FromQuery] int days = 7)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);

            var jobs = await _context.IngestionJobs
                .Include(j => j.Attempts)
                .Where(j => j.StartedAt >= cutoffDate)
                .ToListAsync();

            var totalJobs = jobs.Count;
            var completedJobs = jobs.Count(j => j.Status == nameof(JobStatus.Completed));
            var failedJobs = jobs.Count(j => j.Status == nameof(JobStatus.Failed));

            var allAttempts = jobs.SelectMany(j => j.Attempts).ToList();
            var totalAttempts = allAttempts.Count;
            var successfulAttempts = allAttempts.Count(a => a.Status == nameof(AttemptStatus.Success));
            var failedAttempts = allAttempts.Count(a => a.Status == nameof(AttemptStatus.Failed));

            // Camera có tỷ lệ lỗi cao nhất
            var cameraFailureStats = allAttempts
                .GroupBy(a => a.CameraId)
                .Select(g => new
                {
                    CameraId = g.Key,
                    TotalAttempts = g.Count(),
                    FailedAttempts = g.Count(a => a.Status == nameof(AttemptStatus.Failed)),
                    ErrorRate = g.Count() > 0 
                        ? (double)g.Count(a => a.Status == nameof(AttemptStatus.Failed)) / g.Count() * 100 
                        : 0,
                    AvgLatency = g.Average(a => a.LatencyMs)
                })
                .OrderByDescending(x => x.ErrorRate)
                .Take(10)
                .ToList();

            return Ok(new
            {
                Period = $"Last {days} days",
                Jobs = new
                {
                    Total = totalJobs,
                    Completed = completedJobs,
                    Failed = failedJobs,
                    SuccessRate = totalJobs > 0 ? Math.Round((double)completedJobs / totalJobs * 100, 2) : 0
                },
                Attempts = new
                {
                    Total = totalAttempts,
                    Successful = successfulAttempts,
                    Failed = failedAttempts,
                    SuccessRate = totalAttempts > 0 ? Math.Round((double)successfulAttempts / totalAttempts * 100, 2) : 0,
                    AvgLatency = allAttempts.Any() ? Math.Round(allAttempts.Average(a => a.LatencyMs), 0) : 0
                },
                ProblematicCameras = cameraFailureStats
            });
        }
    }
}
