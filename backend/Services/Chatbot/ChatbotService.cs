using System.Text;
using System.Text.Json;
using HcmcRainVision.Backend.Data;
using HcmcRainVision.Backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace HcmcRainVision.Backend.Services.Chatbot
{
    public interface IChatbotService
    {
        Task<string> GetResponseAsync(string userMessage, CancellationToken cancellationToken = default);
        Task<string> GetRainContextAsync(CancellationToken cancellationToken = default);
    }

    public class ChatbotService : IChatbotService
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey;
        private readonly ILogger<ChatbotService> _logger;

        private const string GeminiEndpoint =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public ChatbotService(
            AppDbContext db,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<ChatbotService> logger)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
            _logger = logger;
        }

        public async Task<string> GetResponseAsync(string userMessage, CancellationToken cancellationToken = default)
        {
            var rainContext = await BuildRainContextAsync(cancellationToken);
            return await CallGeminiAsync(userMessage, rainContext, cancellationToken);
        }

        public Task<string> GetRainContextAsync(CancellationToken cancellationToken = default)
            => BuildRainContextAsync(cancellationToken);

        // Query DB: rain status by district + ward (last 60 min)
        private async Task<string> BuildRainContextAsync(CancellationToken cancellationToken)
        {
            try
            {
                // Dùng 60 phút để tránh "không có dữ liệu" khi scan mới chạy xong
                var timeLimit = DateTime.UtcNow.AddMinutes(-60);

                // Load cameras with ward info
                var cameras = await _db.Cameras
                    .Include(c => c.Ward)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                // Load recent weather logs
                var logs = await _db.WeatherLogs
                    .Where(l => l.Timestamp >= timeLimit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                if (!logs.Any())
                    return "Hiện tại chưa có dữ liệu mưa mới (dữ liệu được cập nhật mỗi 5 phút).";

                // Build lookup: cameraId → district + ward
                var cameraMap = cameras.ToDictionary(c => c.Id, c => new
                {
                    District = c.Ward?.DistrictName ?? "Không xác định",
                    Ward = c.Ward?.WardName ?? "Không xác định"
                });

                var matchedLogs = logs
                    .Where(l => l.CameraId != null && cameraMap.ContainsKey(l.CameraId))
                    .ToList();

                // Group logs by district — chỉ tính IsRaining nếu Confidence >= 0.65 (lọc false positive)
                const float CONFIDENCE_THRESHOLD = 0.65f;
                var grouped = matchedLogs
                    .GroupBy(l => cameraMap[l.CameraId!].District)
                    .Select(g =>
                    {
                        var total = g.Count();
                        var raining = g.Count(l => l.IsRaining && l.Confidence >= CONFIDENCE_THRESHOLD);
                        return new
                        {
                            District = g.Key,
                            Total = total,
                            Raining = raining,
                            IsRaining = raining > 0,
                        };
                    })
                    .OrderBy(d => d.District)
                    .ToList();

                // Ward-level detail: tất cả phường đang được theo dõi (không chỉ phường có mưa)
                var wardByDistrict = matchedLogs
                    .GroupBy(l => new
                    {
                        District = cameraMap[l.CameraId!].District,
                        Ward = cameraMap[l.CameraId!].Ward
                    })
                    .Select(g => new
                    {
                        g.Key.District,
                        g.Key.Ward,
                        IsRaining = g.Any(l => l.IsRaining && l.Confidence >= CONFIDENCE_THRESHOLD)
                    })
                    .OrderBy(x => x.District)
                    .ThenBy(x => x.Ward)
                    .ToList();

                var lines = new List<string>
                {
                    $"Thời điểm cập nhật: {VietnamTime.Now:HH:mm} (giờ VN)",
                    $"Tổng số điểm quan sát: {matchedLogs.Select(l => l.CameraId).Distinct().Count()} camera",
                    "=== Tình trạng mưa theo khu vực ==="
                };

                foreach (var d in grouped)
                {
                    var status = d.IsRaining
                        ? $"CÓ MƯA ({d.Raining}/{d.Total} camera xác nhận)"
                        : $"Không mưa ({d.Total} camera theo dõi)";
                    lines.Add($"- {d.District}: {status}");
                }

                if (wardByDistrict.Any())
                {
                    lines.Add("=== Chi tiết phường/xã đang theo dõi ===");
                    foreach (var w in wardByDistrict)
                    {
                        var rain = w.IsRaining ? " [CÓ MƯA]" : "";
                        lines.Add($"- {w.Ward} ({w.District}){rain}");
                    }
                }

                return string.Join("\n", lines);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu mưa cho chatbot");
                return "Không thể lấy dữ liệu mưa tại thời điểm này.";
            }
        }

        private async Task<string> CallGeminiAsync(string userMessage, string rainContext, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return "Chatbot chưa được cấu hình API key. Vui lòng liên hệ quản trị viên.";

            var systemPrompt = $"""
                Bạn là trợ lý thời tiết của hệ thống HCMCRainVision - hệ thống giám sát mưa TP.HCM bằng camera AI.
                
                BẢNG ÁNH XẠ KHU VỰC → QUẬN/HUYỆN CŨ (dùng để hiểu câu hỏi của người dùng):
                - Khu trung tâm = Quận 1, Quận 3, Quận 10
                - Khu Nam Sài Gòn = Quận 4, Quận 7, Quận 8
                - Khu Chợ Lớn = Quận 5, Quận 6, Quận 11
                - Khu Tân Bình - Phú Nhuận = Quận Tân Bình, Quận Phú Nhuận
                - Khu Bình Tân - Tân Phú = Quận Bình Tân, Quận Tân Phú
                - Khu Bình Thạnh - Gò Vấp = Quận Bình Thạnh, Quận Gò Vấp
                - Khu Quận 12 - Bắc Sài Gòn = Quận 12
                - TP. Thủ Đức = Quận 2 cũ, Quận 9 cũ, Quận Thủ Đức cũ
                - Khu Nhà Bè - Bình Chánh = Huyện Nhà Bè, Huyện Bình Chánh
                - Khu Củ Chi - Hóc Môn = Huyện Củ Chi, Huyện Hóc Môn
                - Khu Cần Giờ = Huyện Cần Giờ
                
                Ví dụ: Nếu người dùng hỏi "Quận 7" → tra bảng → "Khu Nam Sài Gòn", rồi dùng dữ liệu của "Khu Nam Sài Gòn" để trả lời.
                
                DỮ LIỆU THỰC TẾ TỪ HỆ THỐNG (cập nhật mỗi 5 phút, lấy trong 60 phút gần nhất):
                {rainContext}
                
                QUY TẮC:
                - Chỉ trả lời các câu hỏi liên quan đến thời tiết, mưa tại TP.HCM.
                - Chỉ sử dụng dữ liệu được cung cấp ở trên, không đoán mò hoặc dùng kiến thức ngoài.
                - Khi người dùng hỏi tên quận/huyện cũ, hãy ánh xạ sang tên khu vực mới theo bảng ở trên rồi mới tra dữ liệu.
                - Nếu không có dữ liệu về khu vực được hỏi, nói rõ "không có dữ liệu cho khu vực này".
                - Trả lời bằng tiếng Việt, ngắn gọn (tối đa 3-4 câu).
                - Không trả lời câu hỏi ngoài phạm vi thời tiết TP.HCM.
                - Khi được hỏi về tuyến đường, hãy đề cập tình trạng mưa các khu vực nằm dọc tuyến đó.
                - Mưa được xác nhận khi ít nhất 1 camera với độ tin cậy >= 65% phát hiện mưa.
                """;

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userMessage } }
                    }
                },
                generationConfig = new
                {
                    maxOutputTokens = 400,
                    temperature = 0.2
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(20);

            try
            {
                var response = await client.PostAsync(
                    $"{GeminiEndpoint}?key={_apiKey}",
                    new StringContent(json, Encoding.UTF8, "application/json"),
                    cancellationToken);

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini API lỗi {Status}: {Body}", response.StatusCode, responseBody);
                    return "Không thể kết nối với trợ lý AI lúc này. Vui lòng thử lại sau.";
                }

                using var doc = JsonDocument.Parse(responseBody);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return text ?? "Không có phản hồi từ trợ lý AI.";
            }
            catch (TaskCanceledException)
            {
                return "Trợ lý AI phản hồi quá chậm. Vui lòng thử lại.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi Gemini API");
                return "Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.";
            }
        }
    }
}


