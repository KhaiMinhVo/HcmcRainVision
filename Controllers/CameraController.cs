using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Entities;
using HcmcRainVision.Backend.Models.Enums;
using HcmcRainVision.Backend.Models.Constants;
using HcmcRainVision.Backend.Services.AI;
using HcmcRainVision.Backend.Services.Crawling;
using HcmcRainVision.Backend.Utils;
using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;

namespace HcmcRainVision.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ICameraCrawler _crawler;
        private readonly IRainPredictionService _aiService;

        public CameraController(
            AppDbContext context,
            IWebHostEnvironment env,
            ICameraCrawler crawler,
            IRainPredictionService aiService)
        {
            _context = context;
            _env = env;
            _crawler = crawler;
            _aiService = aiService;
        }

        // 1. Lấy danh sách camera (Public - Ai cũng xem được)
        [HttpGet]
        public async Task<IActionResult> GetCameras(
            [FromQuery] string? search,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // ĐÃ SỬA: Thêm Include(c => c.Streams) để join bảng CameraStreams
            var query = _context.Cameras.Include(c => c.Streams).AsQueryable();

            // Filtering & Search
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.Name.Contains(search) || c.Id.Contains(search));
            }

            // Sorting
            query = sortBy?.ToLower() switch
            {
                "name" => query.OrderBy(c => c.Name),
                "name_desc" => query.OrderByDescending(c => c.Name),
                _ => query.OrderBy(c => c.Id)
            };

            // Paging
            var totalItems = await query.CountAsync();
            
            // ĐÃ SỬA: Tách riêng việc lấy danh sách camera...
            var cameras = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            // ... và Map dữ liệu để thêm trường StreamUrl cho Frontend
            // ⚠️ Convert LastUpdatedAt từ UTC → Vietnam Time (Giờ Việt Nam)
            var items = cameras.Select(c => new 
            {
                Id = c.Id,
                Name = c.Name,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                WardId = c.WardId,
                Status = c.Status,
                LastUpdatedAt = c.LastUpdatedAt.HasValue ? VietnamTime.ToVietnamTime(c.LastUpdatedAt.Value) : (DateTime?)null,
                // Lấy link Stream chính (nếu có)
                StreamUrl = c.Streams.FirstOrDefault(s => s.IsPrimary)?.StreamUrl
            });

            return Ok(new { Total = totalItems, Page = page, PageSize = pageSize, Data = items });
        }

        // 2. Thêm camera mới (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> AddCamera([FromBody] CreateCameraRequest request)
        {
            if (await _context.Cameras.AnyAsync(c => c.Id == request.Id))
            {
                return BadRequest("ID Camera này đã tồn tại.");
            }

            // Validate WardId
            if (!string.IsNullOrEmpty(request.WardId))
            {
                var wardExists = await _context.Wards.AnyAsync(w => w.WardId == request.WardId);
                if (!wardExists)
                {
                    var availableWards = await _context.Wards.Select(w => w.WardId).ToListAsync();
                    return BadRequest(new 
                    { 
                        error = $"Ward '{request.WardId}' không tồn tại.",
                        availableWards = availableWards,
                        suggestion = "Vui lòng sử dụng một trong các Ward ID có sẵn hoặc để trống để tự động gán Ward 'DEFAULT'."
                    });
                }
            }
            else
            {
                // Gán Ward mặc định nếu không cung cấp
                request.WardId = "DEFAULT";
            }

            // Tạo Camera (không dùng SourceUrl cũ)
            var camera = new Camera
            {
                Id = request.Id,
                Name = request.Name,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                WardId = request.WardId,
                Status = nameof(CameraStatus.Active),
                LastUpdatedAt = DateTime.UtcNow
            };

            _context.Cameras.Add(camera);

            // Tạo CameraStream tương ứng
            if (!string.IsNullOrEmpty(request.StreamUrl))
            {
                var stream = new CameraStream
                {
                    CameraId = camera.Id,
                    StreamUrl = request.StreamUrl,
                    StreamType = request.StreamType ?? "Snapshot",
                    IsPrimary = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CameraStreams.Add(stream);
            }

            await _context.SaveChangesAsync();
            
            // Trả về response không có navigation properties để tránh circular reference
            return Ok(new 
            { 
                camera = new 
                {
                    camera.Id,
                    camera.Name,
                    camera.Latitude,
                    camera.Longitude,
                    camera.WardId,
                    camera.Status,
                    LastUpdatedAt = camera.LastUpdatedAt.HasValue ? VietnamTime.ToVietnamTime(camera.LastUpdatedAt.Value) : (DateTime?)null
                },
                message = "Camera và Stream đã được tạo thành công" 
            });
        }

        // 3. Xóa camera (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCamera(string id)
        {
            var camera = await _context.Cameras.FindAsync(id);
            if (camera == null) return NotFound();

            _context.Cameras.Remove(camera);
            await _context.SaveChangesAsync();
            
            // Lưu ý: Ảnh của camera này (nếu lưu Local) vẫn tồn tại trong wwwroot/images/rain_logs/
                // Các ảnh này sẽ được dọn dẹp tự động sau 2 ngày bởi CleanupOldImagesAsync() trong Worker
            // Nếu muốn xóa ngay lập tức, có thể thêm logic tìm và xóa các file có pattern {cameraId}_*
            
            return Ok(new { message = "Đã xóa camera thành công" });
        }
        
        // 4. Sửa thông tin camera (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCamera(string id, [FromBody] UpdateCameraRequest request)
        {
            var camera = await _context.Cameras
                .Include(c => c.Streams)
                .FirstOrDefaultAsync(c => c.Id == id);
                
            if (camera == null) return NotFound();

            // Cập nhật thông tin camera
            camera.Name = request.Name;
            camera.Latitude = request.Latitude;
            camera.Longitude = request.Longitude;
            camera.WardId = request.WardId;
            camera.Status = request.Status ?? camera.Status;
            camera.LastUpdatedAt = DateTime.UtcNow;

            // Cập nhật hoặc tạo stream mới
            if (!string.IsNullOrEmpty(request.StreamUrl))
            {
                var primaryStream = camera.Streams.FirstOrDefault(s => s.IsPrimary);
                if (primaryStream != null)
                {
                    primaryStream.StreamUrl = request.StreamUrl;
                    primaryStream.IsActive = true;
                }
                else
                {
                    _context.CameraStreams.Add(new CameraStream
                    {
                        CameraId = camera.Id,
                        StreamUrl = request.StreamUrl,
                        StreamType = "Snapshot",
                        IsPrimary = true,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(camera);
        }

        // 5. Upload ảnh demo và gán vào camera test mode (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/demo-image")]
        [RequestSizeLimit(10_000_000)] // 10MB
        public async Task<IActionResult> UploadDemoImage(string id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File ảnh không hợp lệ." });
            }

            byte[] rawBytes;
            await using (var input = file.OpenReadStream())
            {
                using var ms = new MemoryStream();
                await input.CopyToAsync(ms);
                rawBytes = ms.ToArray();
            }

            // Dựa trên nội dung ảnh thật (không dựa đuôi file) rồi chuẩn hóa về JPEG
            byte[] normalizedJpeg;
            try
            {
                using var decoded = OpenCvSharp.Cv2.ImDecode(rawBytes, OpenCvSharp.ImreadModes.Color);
                if (decoded.Empty())
                {
                    return BadRequest(new { message = "Không đọc được nội dung ảnh. Vui lòng chọn file ảnh hợp lệ." });
                }

                OpenCvSharp.Cv2.ImEncode(".jpg", decoded, out normalizedJpeg);
            }
            catch
            {
                return BadRequest(new { message = "Định dạng ảnh không được hỗ trợ. Hãy dùng ảnh chụp chuẩn (jpg/png/webp/bmp)." });
            }

            var camera = await _context.Cameras
                .Include(c => c.Streams)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (camera == null)
            {
                return NotFound(new { message = $"Không tìm thấy camera '{id}'" });
            }

            var fileName = $"{id}_{DateTime.UtcNow:yyyyMMddHHmmss}.jpg";
            var demoDir = Path.Combine(_env.WebRootPath, "images", "demo-cameras");
            Directory.CreateDirectory(demoDir);
            var savePath = Path.Combine(demoDir, fileName);
            await System.IO.File.WriteAllBytesAsync(savePath, normalizedJpeg);

            var primaryStream = camera.Streams.FirstOrDefault(s => s.IsPrimary);
            if (primaryStream == null)
            {
                primaryStream = new CameraStream
                {
                    CameraId = camera.Id,
                    IsPrimary = true,
                    IsActive = true,
                    StreamType = "Test",
                    CreatedAt = DateTime.UtcNow
                };
                _context.CameraStreams.Add(primaryStream);
            }

            primaryStream.StreamUrl = $"{AppConstants.Camera.TestModeUrl}:{fileName}";
            primaryStream.StreamType = "Test";
            primaryStream.IsActive = true;

            if (camera.Status != nameof(CameraStatus.Active))
            {
                camera.Status = nameof(CameraStatus.Active);
            }

            camera.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã upload ảnh demo và chuyển camera sang TEST_MODE thành công.",
                cameraId = camera.Id,
                streamUrl = primaryStream.StreamUrl,
                imageUrl = $"/images/demo-cameras/{fileName}"
            });
        }

        // 6. Bật test mode bằng ảnh đã có sẵn (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/demo-image")]
        public async Task<IActionResult> SetDemoImage(string id, [FromBody] SetDemoImageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FileName))
            {
                return BadRequest(new { message = "FileName là bắt buộc." });
            }

            var safeFileName = Path.GetFileName(request.FileName);
            var demoPath = Path.Combine(_env.WebRootPath, "images", "demo-cameras", safeFileName);
            if (!System.IO.File.Exists(demoPath))
            {
                return NotFound(new { message = $"Không tìm thấy file demo '{safeFileName}'" });
            }

            var camera = await _context.Cameras
                .Include(c => c.Streams)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (camera == null)
            {
                return NotFound(new { message = $"Không tìm thấy camera '{id}'" });
            }

            var primaryStream = camera.Streams.FirstOrDefault(s => s.IsPrimary);
            if (primaryStream == null)
            {
                primaryStream = new CameraStream
                {
                    CameraId = camera.Id,
                    IsPrimary = true,
                    IsActive = true,
                    StreamType = "Test",
                    CreatedAt = DateTime.UtcNow
                };
                _context.CameraStreams.Add(primaryStream);
            }

            primaryStream.StreamUrl = $"{AppConstants.Camera.TestModeUrl}:{safeFileName}";
            primaryStream.StreamType = "Test";
            primaryStream.IsActive = true;
            camera.LastUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã gán ảnh demo cho camera.",
                cameraId = camera.Id,
                streamUrl = primaryStream.StreamUrl,
                imageUrl = $"/images/demo-cameras/{safeFileName}"
            });
        }

        // 7. Tắt test mode: trả stream về URL thật (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/restore-stream")]
        public async Task<IActionResult> RestoreStreamUrl(string id, [FromBody] RestoreStreamRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.StreamUrl))
            {
                return BadRequest(new { message = "StreamUrl là bắt buộc." });
            }

            var camera = await _context.Cameras
                .Include(c => c.Streams)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (camera == null)
            {
                return NotFound(new { message = $"Không tìm thấy camera '{id}'" });
            }

            var primaryStream = camera.Streams.FirstOrDefault(s => s.IsPrimary);
            if (primaryStream == null)
            {
                primaryStream = new CameraStream
                {
                    CameraId = camera.Id,
                    IsPrimary = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CameraStreams.Add(primaryStream);
            }

            primaryStream.StreamUrl = request.StreamUrl;
            primaryStream.StreamType = request.StreamType ?? "Snapshot";
            primaryStream.IsActive = true;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã khôi phục stream URL thật cho camera.", cameraId = camera.Id, streamUrl = primaryStream.StreamUrl });
        }

        // 8. Chạy test AI ngay trên 1 camera để demo (Chỉ Admin)
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/run-ai-test")]
        public async Task<IActionResult> RunAiTest(string id, [FromBody] RunAiTestRequest? request)
        {
            var camera = await _context.Cameras
                .Include(c => c.Streams)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (camera == null)
            {
                return NotFound(new { message = $"Không tìm thấy camera '{id}'" });
            }

            var primaryStream = camera.Streams.FirstOrDefault(s => s.IsPrimary && s.IsActive);
            if (primaryStream == null || string.IsNullOrWhiteSpace(primaryStream.StreamUrl))
            {
                return BadRequest(new { message = "Camera chưa có stream chính đang hoạt động." });
            }

            var imageBytes = await _crawler.FetchImageAsync(primaryStream.StreamUrl);
            if (imageBytes == null || imageBytes.Length == 0)
            {
                return StatusCode(502, new { message = "Không lấy được ảnh từ stream camera." });
            }

            var prediction = _aiService.Predict(imageBytes);
            var shouldSaveLog = request?.SaveWeatherLog ?? true;

            if (shouldSaveLog)
            {
                var weatherLog = new WeatherLog
                {
                    CameraId = camera.Id,
                    IsRaining = prediction.IsRaining,
                    Confidence = prediction.Confidence,
                    Timestamp = DateTime.UtcNow,
                    Location = new Point(camera.Longitude, camera.Latitude) { SRID = 4326 }
                };
                _context.WeatherLogs.Add(weatherLog);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "AI test chạy thành công.",
                cameraId = camera.Id,
                cameraName = camera.Name,
                streamUrl = primaryStream.StreamUrl,
                prediction = new
                {
                    isRaining = prediction.IsRaining,
                    confidence = prediction.Confidence,
                    aiMessage = prediction.Message
                },
                savedToWeatherLog = shouldSaveLog,
                testedAtVn = VietnamTime.Now
            });
        }
    }

    // DTOs for API requests
    public class CreateCameraRequest
    {
        [Required(ErrorMessage = "ID camera là bắt buộc.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "ID phải từ 3-50 ký tự.")]
        public string Id { get; set; } = null!;

        [Required(ErrorMessage = "Tên camera là bắt buộc.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Tên phải từ 5-200 ký tự.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Vĩ độ là bắt buộc.")]
        [Range(10.0, 11.0, ErrorMessage = "Vĩ độ phải trong khoảng 10.0 - 11.0 (khu vực TP.HCM).")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Kinh độ là bắt buộc.")]
        [Range(106.0, 107.0, ErrorMessage = "Kinh độ phải trong khoảng 106.0 - 107.0 (khu vực TP.HCM).")]
        public double Longitude { get; set; }

        [StringLength(50, ErrorMessage = "Ward ID tối đa 50 ký tự.")]
        public string? WardId { get; set; }

        [Required(ErrorMessage = "Stream URL là bắt buộc.")]
        [Url(ErrorMessage = "Stream URL phải là URL hợp lệ.")]
        public string StreamUrl { get; set; } = null!;

        [StringLength(20, ErrorMessage = "Stream Type tối đa 20 ký tự.")]
        public string? StreamType { get; set; }
    }

    public class UpdateCameraRequest
    {
        [Required(ErrorMessage = "Tên camera là bắt buộc.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Tên phải từ 5-200 ký tự.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Vĩ độ là bắt buộc.")]
        [Range(10.0, 11.0, ErrorMessage = "Vĩ độ phải trong khoảng 10.0 - 11.0.")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Kinh độ là bắt buộc.")]
        [Range(106.0, 107.0, ErrorMessage = "Kinh độ phải trong khoảng 106.0 - 107.0.")]
        public double Longitude { get; set; }

        [StringLength(50, ErrorMessage = "Ward ID tối đa 50 ký tự.")]
        public string? WardId { get; set; }

        [StringLength(20, ErrorMessage = "Status tối đa 20 ký tự.")]
        public string? Status { get; set; }

        [Url(ErrorMessage = "Stream URL phải là URL hợp lệ.")]
        public string? StreamUrl { get; set; }
    }

    public class SetDemoImageRequest
    {
        [Required(ErrorMessage = "Tên file ảnh là bắt buộc.")]
        public string FileName { get; set; } = null!;
    }

    public class RestoreStreamRequest
    {
        [Required(ErrorMessage = "Stream URL là bắt buộc.")]
        [Url(ErrorMessage = "Stream URL phải là URL hợp lệ.")]
        public string StreamUrl { get; set; } = null!;

        [StringLength(20, ErrorMessage = "Stream Type tối đa 20 ký tự.")]
        public string? StreamType { get; set; }
    }

    public class RunAiTestRequest
    {
        public bool SaveWeatherLog { get; set; } = true;
    }
}
