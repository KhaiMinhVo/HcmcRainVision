using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Models.Entities;
using HcmcRainVision.Backend.Services.AI;
using HcmcRainVision.Backend.Services.Crawling;
using HcmcRainVision.Backend.Services.ImageProcessing;
using HcmcRainVision.Backend.Services.Notification;
using HcmcRainVision.Backend.Models.Enums;
using HcmcRainVision.Backend.Models.Constants;
using HcmcRainVision.Backend.Hubs;
using HcmcRainVision.Backend.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace HcmcRainVision.Backend.BackgroundJobs
{
    public class RainScanningWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RainScanningWorker> _logger;
        private readonly IWebHostEnvironment _env;
        private readonly IHubContext<RainHub> _hubContext;

        // Thay bool bằng SemaphoreSlim để lock an toàn hơn
        private readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);
        
        // Biến để theo dõi lần chạy cleanup cuối cùng
        private DateTime _lastCleanupTime = DateTime.MinValue;

        public RainScanningWorker(IServiceProvider serviceProvider, ILogger<RainScanningWorker> logger, IWebHostEnvironment env, IHubContext<RainHub> hubContext)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _env = env;            _hubContext = hubContext;        }

        public override async Task StartAsync(CancellationToken cancellationToken)
        {
            // 1. Dọn dẹp các Job bị treo do lần tắt server trước
            await ResetStuckJobsAsync();
            await base.StartAsync(cancellationToken);
        }

        private async Task ResetStuckJobsAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var stuckJobs = await db.IngestionJobs
                    .Where(j => j.Status == nameof(JobStatus.Running))
                    .ToListAsync();

                if (stuckJobs.Any())
                {
                    foreach (var job in stuckJobs)
                    {
                        job.Status = nameof(JobStatus.Failed);
                        job.Notes = "System restart/crash while running";
                        job.EndedAt = DateTime.UtcNow;
                    }
                    await db.SaveChangesAsync();
                    _logger.LogWarning($"Đã dọn dẹp {stuckJobs.Count} job bị treo.");
                }
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Rain Scanning Worker starting...");

            while (!stoppingToken.IsCancellationRequested)
            {
                // Thử wait lock trong 0ms (kiểm tra xem có ai đang chạy không)
                if (!await _lock.WaitAsync(0))
                {
                    _logger.LogWarning("⚠️ Job cũ chưa chạy xong. Bỏ qua lượt này.");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                    continue;
                }

                Guid jobId = Guid.NewGuid();

                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        // Tạo Job Log
                        var job = new IngestionJob { JobId = jobId, JobType = "Scheduled", Status = nameof(JobStatus.Running), StartedAt = DateTime.UtcNow };
                        db.IngestionJobs.Add(job);
                        await db.SaveChangesAsync();

                        // Lấy danh sách Stream đang Active (CHỈ LẤY PRIMARY để tránh xử lý trùng)
                        var streams = await db.CameraStreams
                            .Include(s => s.Camera)
                                .ThenInclude(c => c.Ward)
                            .Where(s => s.IsActive 
                                     && s.IsPrimary  // CHỈ lấy luồng chính, bỏ qua backup stream
                                     && s.Camera.Status != nameof(CameraStatus.Maintenance))
                            .ToListAsync(stoppingToken);

                        var crawlableStreams = streams.Where(IsStaticImageStream).ToList();
                        var skippedStreams = streams.Count - crawlableStreams.Count;

                        _logger.LogInformation($"Đã tải {streams.Count} CameraStream cần quét. Hợp lệ ảnh tĩnh: {crawlableStreams.Count}, bỏ qua: {skippedStreams}.");

                        // TỐI ƯU N+1: Load tất cả subscriptions RA NGOÀI vòng lặp
                        // TODO: Hiện tại chỉ hỗ trợ theo Ward. Nếu muốn hỗ trợ bán kính (CenterPoint/RadiusMeters),
                        // cần thêm Spatial Query để kiểm tra khoảng cách giữa Camera và CenterPoint
                        var activeSubscriptions = await db.AlertSubscriptions
                            .Include(s => s.User)
                            .Include(s => s.Ward)
                            .Where(s => s.IsEnabled && s.WardId != null)  // Hiện tại chỉ lấy theo Ward
                            .ToListAsync(stoppingToken);

                        // Gom nhóm theo WardId để tra cứu nhanh O(1)
                        var subsByWard = activeSubscriptions
                            .GroupBy(s => s.WardId!)
                            .ToDictionary(g => g.Key, g => g.ToList());

                        _logger.LogInformation($"Đã tải {activeSubscriptions.Count} subscriptions từ {subsByWard.Count} phường.");

                        // Xử lý song song (Max 3 camera cùng lúc để tránh quá tải database)
                        // Giảm từ 5 xuống 3 để tránh timeout khi có nhiều camera cùng lúc
                        var parallelOptions = new ParallelOptions { MaxDegreeOfParallelism = 3, CancellationToken = stoppingToken };

                        // Thêm timeout cho toàn bộ parallel processing (15 phút)
                        using var parallelCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                        parallelCts.CancelAfter(TimeSpan.FromMinutes(15));
                        
                        try
                        {
                            await Parallel.ForEachAsync(crawlableStreams, parallelOptions, async (stream, token) =>
                            {
                                await ProcessCameraAsync(stream, jobId, scope.ServiceProvider, subsByWard, token);
                            });
                        }
                        catch (OperationCanceledException)
                        {
                            _logger.LogWarning("⏱️ Parallel processing timeout - exceeded 15 minute limit");
                        }

                        // Kết thúc Job
                        job.Status = nameof(JobStatus.Completed);
                        job.EndedAt = DateTime.UtcNow;
                        job.Notes = $"Processed {crawlableStreams.Count}/{streams.Count} streams (skipped non-static: {skippedStreams})";
                        
                        try
                        {
                            await db.SaveChangesAsync();
                        }
                        catch (Exception dbEx)
                        {
                            _logger.LogError(dbEx, "Failed to save job completion status");
                        }
                        
                        _logger.LogInformation($"✅ Hoàn thành Job #{jobId}");
                        
                        // SỬA LỖI HIỆU NĂNG: Chỉ Cleanup 1 lần mỗi ngày
                        if (DateTime.UtcNow.Day != _lastCleanupTime.Day)
                        {
                            await CleanupOldImagesAsync();
                            await CleanupOldDataAsync(db, stoppingToken);
                            _lastCleanupTime = DateTime.UtcNow;
                            _logger.LogInformation("🧹 Đã chạy cleanup hàng ngày.");
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    // Graceful shutdown - không cần log lỗi vì đây là hành động dự kiến
                    _logger.LogInformation("RainScanningWorker: Shutdown được kích hoạt gracefully.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Critical error in RainScanningWorker");
                }
                finally
                {
                    _lock.Release(); // Giải phóng lock
                }

                // Chờ 5 phút
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task ProcessCameraAsync(CameraStream stream, Guid jobId, IServiceProvider services, Dictionary<string, List<AlertSubscription>> subsByWard, CancellationToken token)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var crawler = scope.ServiceProvider.GetRequiredService<ICameraCrawler>();
            var aiService = scope.ServiceProvider.GetRequiredService<IRainPredictionService>();
            var firebaseService = scope.ServiceProvider.GetRequiredService<IFirebasePushService>();
            var cloudService = scope.ServiceProvider.GetRequiredService<ICloudStorageService>();
            var preProcessor = scope.ServiceProvider.GetRequiredService<IImagePreProcessor>();

            var attempt = new IngestionAttempt { AttemptId = Guid.NewGuid(), JobId = jobId, CameraId = stream.CameraId, AttemptAt = DateTime.UtcNow };
            var attemptStartTime = DateTime.UtcNow;

            try
            {
                if (!IsStaticImageStream(stream))
                {
                    attempt.Status = nameof(AttemptStatus.Failed);
                    attempt.ErrorMessage = "Unsupported stream type for image crawler (requires static image URL)";
                    attempt.LatencyMs = 0;
                    db.IngestionAttempts.Add(attempt);
                    await db.SaveChangesAsync(token);
                    _logger.LogWarning($"⏭️ Bỏ qua stream không hỗ trợ cho crawler ảnh: Camera={stream.CameraId}, Type={stream.StreamType}, Url={stream.StreamUrl}");
                    return;
                }

                // 1. Crawl ảnh
                byte[]? imageBytes = await crawler.FetchImageAsync(stream.StreamUrl);
                double latencyMs = (DateTime.UtcNow - attemptStartTime).TotalMilliseconds;
                
                if (imageBytes == null)
                {
                    attempt.Status = nameof(AttemptStatus.Failed);
                    attempt.ErrorMessage = "Connection Timeout";
                    attempt.LatencyMs = (int)latencyMs;
                    
                    // Log offline
                    var statusLog = new CameraStatusLog
                    {
                        CameraId = stream.CameraId,
                        Status = nameof(CameraStatus.Offline),
                        CheckedAt = DateTime.UtcNow,
                        Reason = "Connection Timeout"
                    };
                    db.CameraStatusLogs.Add(statusLog);
                    
                    // Update Camera Status -> Offline
                    var camera = await db.Cameras.FindAsync(new object[] { stream.CameraId }, token);
                    if (camera != null)
                    {
                        camera.Status = nameof(CameraStatus.Offline);
                        camera.LastUpdatedAt = DateTime.UtcNow;
                    }
                }
                else
                {
                    attempt.Status = nameof(AttemptStatus.Success);
                    attempt.HttpStatus = 200;
                    attempt.LatencyMs = (int)latencyMs;
                    
                    // 2. XỬ LÝ ẢNH TRƯỚC KHI ĐƯA VÀO AI
                    // Resize về 224x224, cắt bỏ timestamp và logo thừa
                    var processedImageBytes = preProcessor.ProcessForAI(imageBytes);
                    
                    if (processedImageBytes == null)
                    {
                        _logger.LogWarning($"❌ Không thể xử lý ảnh từ camera {stream.CameraId}. Bỏ qua.");
                        attempt.Status = nameof(AttemptStatus.Failed);
                        attempt.ErrorMessage = "Image processing failed";
                        db.IngestionAttempts.Add(attempt);
                        await db.SaveChangesAsync(token);
                        return;
                    }
                    
                    // --- ⚠️ HASH CHECK: Phát hiện camera bị treo (SỬA ĐỔI: Hash ảnh ĐÃ XỬ LÝ) ---
                    // Lý do: Ảnh gốc có timestamp thay đổi liên tục -> Hash sẽ khác nhau dù nội dung giống nhau
                    // => Phải hash ảnh SAU KHI đã crop timestamp/logo
                    using var md5 = MD5.Create();
                    var hashBytes = md5.ComputeHash(processedImageBytes);  // Hash ảnh đã xử lý (không còn timestamp)
                    var currentHash = Convert.ToHexString(hashBytes);

                    // Lấy thông tin camera để check hash cũ
                    var currentCamera = await db.Cameras.FindAsync(new object[] { stream.CameraId }, token);
                    
                    if (currentCamera != null && currentCamera.LastImageHash == currentHash)
                    {
                        _logger.LogWarning($"📷 Camera {stream.CameraId} ({stream.Camera.Name}) bị treo - ảnh giống hệt lần trước. Bỏ qua xử lý AI.");
                        
                        // Log stuck camera status
                        var stuckLog = new CameraStatusLog
                        {
                            CameraId = stream.CameraId,
                            Status = "Stuck", // TODO: Thêm CameraStatus.Stuck vào enum
                            CheckedAt = DateTime.UtcNow,
                            Reason = "Duplicate image hash detected (after preprocessing)"
                        };
                        db.CameraStatusLogs.Add(stuckLog);
                        attempt.ErrorMessage = "Stuck camera - duplicate image";
                        
                        db.IngestionAttempts.Add(attempt);
                        await db.SaveChangesAsync(token);
                        return; // Dừng xử lý camera này
                    }

                    // Cập nhật hash mới (EF Core change tracking sẽ tự update)
                    if (currentCamera != null)
                    {
                        currentCamera.LastImageHash = currentHash;
                        currentCamera.LastUpdatedAt = DateTime.UtcNow;
                    }
                    // ----------------------------------------------------------------
                    
                    // 3. AI Dự báo (Sử dụng ảnh đã xử lý để tăng độ chính xác)
                    var prediction = aiService.Predict(processedImageBytes);
                    bool isRainingNow = prediction.IsRaining;

                    // 4. ⚡ TỐI ƯU LƯU TRỮ: CHỈ LƯU ẢNH KHI CÓ MƯA HOẶC CONFIDENCE THẤP
                    // Tiết kiệm > 90% dung lượng Cloud/Local storage
                    string? imageUrl = null;
                    
                    if (isRainingNow || prediction.Confidence < AppConstants.AiPrediction.LowConfidenceThreshold)
                    {
                        string fileName = $"{stream.CameraId}_{DateTime.UtcNow.Ticks}.jpg";
                        imageUrl = await cloudService.UploadImageAsync(imageBytes, fileName); // Lưu ảnh GỐC đẹp, không phải ảnh đã resize

                        if (string.IsNullOrEmpty(imageUrl))
                        {
                            // Fallback: Lưu Local nếu Cloudinary lỗi hoặc chưa config
                            string localPath = Path.Combine(_env.WebRootPath, "images", "rain_logs", fileName);
                            Directory.CreateDirectory(Path.GetDirectoryName(localPath)!);
                            await File.WriteAllBytesAsync(localPath, imageBytes, token);
                            imageUrl = $"/images/rain_logs/{fileName}";
                        }
                        
                        _logger.LogInformation($"💾 Đã lưu ảnh: {fileName} (Mưa: {isRainingNow}, Confidence: {prediction.Confidence:P0})");
                    }
                    else
                    {
                        _logger.LogDebug($"⏭️ Bỏ qua lưu ảnh camera {stream.CameraId} (Không mưa, Confidence cao: {prediction.Confidence:P0})");
                    }

                    // 5. LOGIC CHỐNG SPAM NÂNG CAO
                    // Lấy log mưa gần nhất của camera này
                    var lastRainLog = await db.WeatherLogs
                        .Where(l => l.CameraId == stream.CameraId && l.IsRaining)
                        .OrderByDescending(l => l.Timestamp)
                        .FirstOrDefaultAsync(token);
                    
                    // Chỉ gửi thông báo nếu:
                    // 1. Hiện tại đang mưa
                    // 2. VÀ (Chưa từng mưa HOẶC Lần mưa cuối cách đây hơn cooldown time) -> Tránh spam
                    bool shouldNotify = isRainingNow && 
                                        (lastRainLog == null || (DateTime.UtcNow - lastRainLog.Timestamp).TotalMinutes > AppConstants.Timing.RainAlertCooldownMinutes);

                    if (shouldNotify)
                    {
                        // Gửi Firebase Push Notification (tối ưu với Dictionary)
                        await SendNotificationsOptimizedAsync(stream, prediction.Confidence, subsByWard, firebaseService, db);
                        
                        // GỬI SIGNALR (REAL-TIME CHO WEB) - Gửi theo Group Phường
                        var alertData = new 
                        {
                            CameraId = stream.CameraId,
                            CameraName = stream.Camera.Name,
                            WardName = stream.Camera.Ward?.WardName,
                            DistrictName = stream.Camera.Ward?.DistrictName,
                            ImageUrl = imageUrl,
                            Confidence = prediction.Confidence,
                            Timestamp = DateTime.UtcNow
                        };

                        // Gửi cho Group Dashboard (tổng hợp)
                        await _hubContext.Clients.Group(AppConstants.SignalRGroups.Dashboard)
                            .SendAsync(AppConstants.SignalRGroups.ReceiveRainAlertMethod, alertData, token);
                        
                        // Gửi cho Group Phường cụ thể (WardId)
                        if (!string.IsNullOrEmpty(stream.Camera.WardId))
                        {
                            await _hubContext.Clients.Group(stream.Camera.WardId)
                                .SendAsync(AppConstants.SignalRGroups.ReceiveRainAlertMethod, alertData, token);
                            _logger.LogDebug($"📡 Gửi SignalR tới group Phường: {stream.Camera.WardId}");
                        }
                        
                        _logger.LogInformation($"📡 Đã gửi SignalR alert cho camera {stream.Camera.Name}");
                    }

                    // 6. Lưu Log Kết quả
                    var weatherLog = new WeatherLog
                    {
                        CameraId = stream.CameraId,
                        IsRaining = isRainingNow,
                        Confidence = prediction.Confidence,
                        ImageUrl = imageUrl, // Dùng URL từ Cloudinary hoặc Local
                        Timestamp = DateTime.UtcNow,
                        // Lưu ý: Gán Location từ Camera vào WeatherLog
                        Location = new NetTopologySuite.Geometries.Point(stream.Camera.Longitude, stream.Camera.Latitude) { SRID = 4326 }
                    };
                    db.WeatherLogs.Add(weatherLog);
                    
                    // Log online
                    var statusLog = new CameraStatusLog
                    {
                        CameraId = stream.CameraId,
                        Status = nameof(CameraStatus.Active),
                        CheckedAt = DateTime.UtcNow
                    };
                    db.CameraStatusLogs.Add(statusLog);
                    
                    // Update Camera Status -> Active
                    var camera = await db.Cameras.FindAsync(new object[] { stream.CameraId }, token);
                    if (camera != null)
                    {
                        camera.Status = nameof(CameraStatus.Active);
                        camera.LastUpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            catch (OperationCanceledException ex)
            {
                attempt.Status = nameof(AttemptStatus.Error);
                attempt.ErrorMessage = $"Database operation timeout - {ex.Message}";
                _logger.LogError($"⏱️ Timeout khi xử lý Camera {stream.CameraId}: {ex.Message}");
            }
            catch (TimeoutException ex)
            {
                attempt.Status = nameof(AttemptStatus.Error);
                attempt.ErrorMessage = $"Connection timeout - {ex.Message}";
                _logger.LogError($"⏱️ Timeout kết nối Camera {stream.CameraId}: {ex.Message}");
            }
            catch (Exception ex)
            {
                attempt.Status = nameof(AttemptStatus.Error);
                attempt.ErrorMessage = ex.Message;
                _logger.LogError(ex, $"Lỗi xử lý Camera {stream.CameraId}");
            }

            db.IngestionAttempts.Add(attempt);
            await db.SaveChangesAsync(token);
        }

        // Helper chuyển đổi giờ VN
        private string GetVietnamTime(DateTime utcTime)
        {
            DateTime vnTime = VietnamTime.ToVietnamTime(utcTime);
            return vnTime.ToString("HH:mm dd/MM/yyyy");
        }

        private async Task SendNotificationsOptimizedAsync(
            CameraStream stream, 
            float confidence, 
            Dictionary<string, List<AlertSubscription>> subsByWard,
            IFirebasePushService firebase,
            AppDbContext db)
        {
            string timeStr = VietnamTime.Now.ToString("HH:mm");
            var validTokens = new HashSet<string>();

            // 1. Gom token từ đăng ký theo phường
            if (stream.Camera.WardId != null && subsByWard.ContainsKey(stream.Camera.WardId))
            {
                var wardTokens = subsByWard[stream.Camera.WardId]
                    .Where(s => confidence >= s.ThresholdProbability && !string.IsNullOrEmpty(s.User.DeviceToken))
                    .Select(s => s.User.DeviceToken!);

                foreach (var token in wardTokens)
                {
                    validTokens.Add(token);
                }
            }

            // 2. Gom thêm token theo vị trí gần camera (spatial query)
            var cameraPoint = new NetTopologySuite.Geometries.Point(stream.Camera.Longitude, stream.Camera.Latitude) { SRID = 4326 };
            var timeLimit = DateTime.UtcNow.AddHours(-AppConstants.GIS.LocationFreshnessHours);

            var nearbyUserTokens = await db.Users
                .Where(u => !string.IsNullOrEmpty(u.DeviceToken)
                         && u.IsActive
                         && u.LocationUpdatedAt >= timeLimit
                         && u.LastKnownLocation != null
                         && u.LastKnownLocation!.Distance(cameraPoint) <= AppConstants.GIS.AlertRadiusDegrees)
                .Select(u => u.DeviceToken!)
                .ToListAsync();

            foreach (var token in nearbyUserTokens)
            {
                validTokens.Add(token);
            }

            if (validTokens.Any())
            {
                var tokenList = validTokens.ToList();

                // 2. Gửi Batch (Fire and forget - không chặn worker thread)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        int sentCount = await firebase.SendMulticastAsync(
                            tokenList,
                            "⚠️ Cảnh báo mưa gần bạn!",
                            $"Phát hiện mưa tại {stream.Camera.Name} lúc {timeStr}. Hãy chú ý an toàn!",
                            new Dictionary<string, string>
                            {
                                { "cameraId", stream.CameraId },
                                { "cameraName", stream.Camera.Name },
                                { "confidence", confidence.ToString("F2") },
                                { "timestamp", new DateTimeOffset(VietnamTime.Now, TimeSpan.FromHours(7)).ToString("o") },
                                { "type", "location_based_alert" }
                            }
                        );
                        _logger.LogInformation($"📱 Đã gửi push notification hàng loạt: {sentCount}/{tokenList.Count} thành công");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"❌ Lỗi gửi batch push notifications");
                    }
                });
            }
        }

        private static bool IsStaticImageStream(CameraStream stream)
        {
            var url = stream.StreamUrl ?? string.Empty;
            var streamType = stream.StreamType ?? string.Empty;

            if (url.StartsWith(AppConstants.Camera.TestModeUrl, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (LooksLikePlaylistUrl(url))
            {
                return false;
            }

            if (streamType.Equals("Snapshot", StringComparison.OrdinalIgnoreCase) ||
                streamType.Equals("Image", StringComparison.OrdinalIgnoreCase) ||
                streamType.Equals("Test", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return LooksLikeImageUrl(url);
        }

        private static bool LooksLikePlaylistUrl(string url)
        {
            return url.Contains(".m3u8", StringComparison.OrdinalIgnoreCase);
        }

        private static bool LooksLikeImageUrl(string url)
        {
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                return false;
            }

            var path = uri.AbsolutePath;

            if (path.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) ||
                path.EndsWith(".bmp", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return path.Contains("ImageHandler.ashx", StringComparison.OrdinalIgnoreCase);
        }

        // Tự động xóa ảnh cũ, chỉ giữ 2 ngày gần nhất
        private async Task CleanupOldImagesAsync()
        {
            try
            {
                var folderPath = Path.Combine(_env.WebRootPath, "images", "rain_logs");
                var dir = new DirectoryInfo(folderPath);
                if (dir.Exists)
                {
                    await Task.Run(() =>
                    {
                        foreach (var file in dir.GetFiles())
                        {
                            if (file.CreationTimeUtc < DateTime.UtcNow.AddDays(-2))
                            {
                                file.Delete();
                            }
                        }
                    });
                    _logger.LogInformation("🧹 Đã dọn dẹp ảnh cũ hơn 2 ngày.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cleanup old images");
            }
        }
        
        private async Task CleanupOldDataAsync(AppDbContext db, CancellationToken token)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-7);

                await db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM ingestion_attempts WHERE attempt_at < {0}",
                    cutoffDate
                );

                await db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM ingestion_jobs WHERE started_at < {0}",
                    cutoffDate
                );

                await db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM camera_status_logs WHERE checked_at < {0}",
                    cutoffDate
                );

                _logger.LogInformation("🧹 Đã dọn dẹp dữ liệu cũ hơn 7 ngày.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cleanup old data");
            }
        }
    }
}
