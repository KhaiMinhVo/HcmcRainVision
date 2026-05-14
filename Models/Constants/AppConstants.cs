namespace HcmcRainVision.Backend.Models.Constants
{
    /// <summary>
    /// Hằng số toàn cục cho ứng dụng - Tránh hardcoded strings và magic numbers
    /// </summary>
    public static class AppConstants
    {
        /// <summary>
        /// Các vai trò người dùng trong hệ thống
        /// </summary>
        public static class UserRoles
        {
            public const string Admin = "Admin";
            public const string User = "User";
        }

        /// <summary>
        /// Các nhóm SignalR để broadcast real-time alerts
        /// </summary>
        public static class SignalRGroups
        {
            /// <summary>
            /// Nhóm Dashboard cho Admin xem tổng quan tất cả alerts
            /// </summary>
            public const string Dashboard = "Dashboard";
            
            /// <summary>
            /// Phương thức SignalR để gửi alert xuống client
            /// </summary>
            public const string ReceiveRainAlertMethod = "ReceiveRainAlert";

            /// <summary>
            /// Prefix cho nhóm theo dõi mưa theo route
            /// </summary>
            public const string RouteGroupPrefix = "Route:";

            /// <summary>
            /// Sự kiện cập nhật rủi ro mưa theo route
            /// </summary>
            public const string ReceiveRouteRainUpdateMethod = "ReceiveRouteRainUpdate";

            /// <summary>
            /// Sự kiện ACK khi bật theo dõi route thành công
            /// </summary>
            public const string RouteMonitoringStartedMethod = "RouteMonitoringStarted";

            /// <summary>
            /// Sự kiện ACK khi tắt theo dõi route
            /// </summary>
            public const string RouteMonitoringStoppedMethod = "RouteMonitoringStopped";
        }

        /// <summary>
        /// Ngưỡng và cấu hình AI Prediction
        /// </summary>
        public static class AiPrediction
        {
            /// <summary>
            /// Ngưỡng tin cậy tối thiểu để coi dự đoán là chắc chắn.
            /// Nếu < 0.6, AI không chắc chắn -> cần lưu ảnh để review
            /// </summary>
            public const double LowConfidenceThreshold = 0.6;
        }

        /// <summary>
        /// Cấu hình thời gian cho các tính năng
        /// </summary>
        public static class Timing
        {
            /// <summary>
            /// Thời gian cooldown giữa 2 lần gửi thông báo mưa cho cùng một camera (phút)
            /// Tránh spam notification khi mưa kéo dài
            /// </summary>
            public const int RainAlertCooldownMinutes = 30;
            
            /// <summary>
            /// Chu kỳ quét camera (phút)
            /// </summary>
            public const int CameraScanIntervalMinutes = 5;
        }

        /// <summary>
        /// Loại Job trong hệ thống
        /// </summary>
        public static class JobTypes
        {
            public const string RainScan = "RainScan";
        }
        
        /// <summary>
        /// Firebase Cloud Messaging Topics
        /// </summary>
        public static class Topics
        {
            /// <summary>
            /// Topic để gửi cảnh báo mưa cho tất cả users đã subscribe
            /// </summary>
            public const string RainAlerts = "rain_alerts";
        }
        
        /// <summary>
        /// Cấu hình và hằng số liên quan đến Camera
        /// </summary>
        public static class Camera
        {
            /// <summary>
            /// URL đặc biệt để bật chế độ Test Mode (dùng ảnh giả lập)
            /// </summary>
            public const string TestModeUrl = "TEST_MODE";
        }

        /// <summary>
        /// Hằng số cấu hình cho truy vấn không gian
        /// </summary>
        public static class GIS
        {
            /// <summary>
            /// Bán kính cảnh báo xấp xỉ 2km quanh camera tại khu vực TP.HCM (đơn vị độ)
            /// </summary>
            public const double AlertRadiusDegrees = 0.018;

            /// <summary>
            /// Chỉ dùng vị trí user được cập nhật trong khung thời gian này (giờ)
            /// </summary>
            public const int LocationFreshnessHours = 2;
        }
    }
}
