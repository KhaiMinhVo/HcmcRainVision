using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using HcmcRainVision.Backend.Models.Constants;
using FcmNotification = FirebaseAdmin.Messaging.Notification; // Alias để tránh xung đột namespace

namespace HcmcRainVision.Backend.Services.Notification
{
    public interface IFirebasePushService
    {
        Task<bool> SendRainAlertAsync(string cameraName, string cameraId, double confidence);
        Task<bool> SendToDeviceAsync(string deviceToken, string title, string body, Dictionary<string, string>? data = null);
        Task<int> SendMulticastAsync(List<string> deviceTokens, string title, string body, Dictionary<string, string>? data = null);
    }

    /// <summary>
    /// Service gửi Push Notification qua Firebase Cloud Messaging
    /// </summary>
    public class FirebasePushService : IFirebasePushService
    {
        private readonly ILogger<FirebasePushService> _logger;
        private readonly bool _isEnabled;

        public FirebasePushService(IConfiguration config, ILogger<FirebasePushService> logger)
        {
            _logger = logger;
            
            var credentialPath = config["FirebaseSettings:ServiceAccountPath"];
            
            // Kiểm tra xem Firebase có được cấu hình không
            _isEnabled = !string.IsNullOrEmpty(credentialPath) && File.Exists(credentialPath);

            if (_isEnabled)
            {
                try
                {
                    // Chỉ khởi tạo nếu chưa có app nào
                    if (FirebaseApp.DefaultInstance == null)
                    {
                        FirebaseApp.Create(new AppOptions()
                        {
                            Credential = GoogleCredential.FromFile(credentialPath)
                        });
                        _logger.LogInformation("✅ Firebase Admin SDK đã được khởi tạo thành công");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Không thể khởi tạo Firebase Admin SDK");
                    _isEnabled = false;
                }
            }
            else
            {
                _logger.LogWarning("⚠️ Firebase chưa được cấu hình. Push notification sẽ bị vô hiệu hóa.");
            }
        }

        public async Task<bool> SendRainAlertAsync(string cameraName, string cameraId, double confidence)
        {
            if (!_isEnabled) return false;

            try
            {
                var message = new Message()
                {
                    Notification = new FcmNotification()
                    {
                        Title = "⚠️ Cảnh báo mưa!",
                        Body = $"Phát hiện mưa tại {cameraName} với độ tin cậy {confidence:P0}"
                    },
                    Data = new Dictionary<string, string>()
                    {
                        { "cameraId", cameraId },
                        { "cameraName", cameraName },
                        { "confidence", confidence.ToString() },
                        { "type", "rain_alert" }
                    },
                    Topic = AppConstants.Topics.RainAlerts // Gửi cho tất cả user đã subscribe topic này
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"✅ Đã gửi push notification: {response}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Lỗi gửi Firebase notification: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendToDeviceAsync(string deviceToken, string title, string body, Dictionary<string, string>? data = null)
        {
            if (!_isEnabled) return false;

            try
            {
                var message = new Message()
                {
                    Token = deviceToken,
                    Notification = new FcmNotification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data ?? new Dictionary<string, string>()
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"✅ Đã gửi notification đến device: {response}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Lỗi gửi notification đến device: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Gửi notification hàng loạt đến nhiều devices (Batch sending)
        /// Firebase hỗ trợ tối đa 500 tokens mỗi lần gửi
        /// </summary>
        /// <param name="deviceTokens">Danh sách device tokens</param>
        /// <param name="title">Tiêu đề notification</param>
        /// <param name="body">Nội dung notification</param>
        /// <param name="data">Dữ liệu tùy chỉnh (optional)</param>
        /// <returns>Số lượng gửi thành công</returns>
        public async Task<int> SendMulticastAsync(List<string> deviceTokens, string title, string body, Dictionary<string, string>? data = null)
        {
            if (!_isEnabled || deviceTokens == null || !deviceTokens.Any())
            {
                _logger.LogWarning("⚠️ Firebase không được kích hoạt hoặc không có device tokens");
                return 0;
            }

            // Firebase cho phép tối đa 500 tokens mỗi lần gửi
            var batches = deviceTokens.Chunk(500);
            int successCount = 0;

            foreach (var batch in batches)
            {
                var message = new MulticastMessage()
                {
                    Tokens = batch.ToList(),
                    Notification = new FcmNotification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data ?? new Dictionary<string, string>()
                };

                try
                {
                    var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
                    successCount += response.SuccessCount;

                    // Log các token bị lỗi để xử lý sau (có thể xóa khỏi DB nếu token hết hạn)
                    if (response.FailureCount > 0)
                    {
                        _logger.LogWarning($"⚠️ {response.FailureCount}/{batch.Count()} tokens gửi thất bại trong batch này");
                        
                        // TODO: Xử lý các token lỗi - response.Responses[i].IsSuccess == false
                        // Nên xóa khỏi DB các token không còn hợp lệ
                    }

                    _logger.LogInformation($"✅ Multicast: {response.SuccessCount}/{batch.Count()} thành công");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"❌ Lỗi gửi Multicast Firebase: {ex.Message}");
                }
            }

            return successCount;
        }
    }
}
