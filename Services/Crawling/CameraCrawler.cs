using System.Net.Http.Headers;
using HcmcRainVision.Backend.Models.Constants;
using Polly.Timeout;

namespace HcmcRainVision.Backend.Services.Crawling
{
    public interface ICameraCrawler
    {
        Task<byte[]?> FetchImageAsync(string url);
    }

    public class CameraCrawler : ICameraCrawler
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<CameraCrawler> _logger;
        private readonly IWebHostEnvironment _env;
        
        // Danh sách User-Agent để thay đổi liên tục, tránh bị firewall phát hiện là bot
        // QUAN TRỌNG: Luôn bao gồm thông tin dự án để admin server gốc có thể liên hệ nếu cần
        private readonly string[] _userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "HcmcRainVision/1.0 (+https://github.com/KhaiMinhVo/HcmcRainVision.Backend; khaivpmse184623@fpt.edu.vn)" // Custom agent với thông tin liên hệ
        };

        public CameraCrawler(IHttpClientFactory httpClientFactory, ILogger<CameraCrawler> logger, IWebHostEnvironment env)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _env = env;
        }

        public async Task<byte[]?> FetchImageAsync(string url)
        {
            // 1. Chế độ giả lập (Dành cho lúc test hoặc API thật bị sập)
            if (url.StartsWith(AppConstants.Camera.TestModeUrl))
            {
                return await GetFakeImageAsync(url);
            }

            // 2. Tạo Named Client từ Factory (Polly sẽ tự động retry)
            var client = _httpClientFactory.CreateClient("CameraClient");
            var startTime = DateTime.UtcNow;

            try 
            {
                _logger.LogInformation($"[CameraCrawler] Đang tải ảnh từ: {url}");
                
                var response = await client.GetAsync(url);
                
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogInformation($"[CameraCrawler] ✅ Phản hồi nhận được trong {elapsedMs:F0}ms từ: {url}");
                
                // Nếu lỗi (404, 403...) ném ra exception
                response.EnsureSuccessStatusCode();

                // Kiểm tra xem có đúng là ảnh không (Content-Type)
                var mediaType = response.Content.Headers.ContentType?.MediaType;
                if (mediaType != "image/jpeg" && mediaType != "image/png")
                {
                    _logger.LogWarning($"[CameraCrawler] ⚠️ URL không trả về ảnh! Content-Type: {mediaType} từ {url}");
                    return null;
                }

                // Đọc dữ liệu ảnh thành mảng byte (để chuyển cho AI xử lý)
                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                _logger.LogInformation($"[CameraCrawler] ✅ Tải thành công {imageBytes.Length} bytes từ {url}");
                
                return imageBytes;
            }
            catch (TimeoutRejectedException timeoutEx)
            {
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogWarning($"[CameraCrawler] ⏱️ Polly timeout sau {elapsedMs:F0}ms từ {url}: {timeoutEx.Message}");
                return null;
            }
            catch (HttpRequestException httpEx) when (httpEx.InnerException is TimeoutException || httpEx.Message.Contains("timeout"))
            {
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogWarning($"[CameraCrawler] ⏱️ Timeout sau {elapsedMs:F0}ms từ {url}: {httpEx.Message}");
                return null;
            }
            catch (TaskCanceledException cancelEx)
            {
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogWarning($"[CameraCrawler] 🚫 Request bị hủy hoặc timeout sau {elapsedMs:F0}ms từ {url}: {cancelEx.Message}");
                return null;
            }
            catch (HttpRequestException httpEx)
            {
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogError($"[CameraCrawler] ❌ HTTP Error sau {elapsedMs:F0}ms từ {url}: {httpEx.Message}");
                return null;
            }
            catch (Exception ex)
            {
                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogError(ex, $"[CameraCrawler] ❌ Lỗi bất ngờ sau {elapsedMs:F0}ms khi crawl {url}");
                return null;
            }
        }

        // Hàm giả lập ảnh:
        // - TEST_MODE => dùng sample_rain.jpg
        // - TEST_MODE:tenfile.jpg => dùng file trong wwwroot/images/demo-cameras
        private async Task<byte[]> GetFakeImageAsync(string streamUrl)
        {
            _logger.LogInformation("--- TEST MODE: Đang dùng ảnh giả lập ---");
            var defaultPath = Path.Combine(_env.ContentRootPath, "sample_rain.jpg");
            var path = defaultPath;

            // Hỗ trợ format TEST_MODE:filename.jpg để test linh hoạt theo camera
            var parts = streamUrl.Split(':', 2, StringSplitOptions.TrimEntries);
            if (parts.Length == 2 && !string.IsNullOrWhiteSpace(parts[1]))
            {
                var safeFileName = Path.GetFileName(parts[1]);
                if (!string.IsNullOrWhiteSpace(safeFileName))
                {
                    path = Path.Combine(_env.WebRootPath, "images", "demo-cameras", safeFileName);
                }
            }
            
            if (File.Exists(path))
            {
                return await File.ReadAllBytesAsync(path);
            }

            if (File.Exists(defaultPath))
            {
                _logger.LogWarning($"Không tìm thấy ảnh test '{path}', fallback về sample_rain.jpg");
                return await File.ReadAllBytesAsync(defaultPath);
            }

            _logger.LogWarning($"Không tìm thấy ảnh test mode: {path}");
            return Array.Empty<byte>();
        }
    }
}