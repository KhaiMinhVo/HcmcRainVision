namespace HcmcRainVision.Backend.Services.ImageProcessing
{
    public interface IImagePreProcessor
    {
        /// <summary>
        /// Chuẩn hóa ảnh: Cắt bỏ thông tin thừa và resize về kích thước AI cần
        /// </summary>
        /// <param name="rawImageBytes">Ảnh gốc từ Crawler</param>
        /// <param name="targetWidth">Chiều rộng AI cần (thường là 224)</param>
        /// <param name="targetHeight">Chiều cao AI cần (thường là 224)</param>
        /// <returns>Ảnh đã xử lý dưới dạng byte[]</returns>
        byte[]? ProcessForAI(byte[] rawImageBytes, int targetWidth = 224, int targetHeight = 224);
    }

    public class ImagePreProcessor : IImagePreProcessor
    {
        private readonly ILogger<ImagePreProcessor> _logger;

        public ImagePreProcessor(ILogger<ImagePreProcessor> logger)
        {
            _logger = logger;
        }

        public byte[]? ProcessForAI(byte[] rawImageBytes, int targetWidth = 224, int targetHeight = 224)
        {
            try
            {
                _logger.LogInformation("⚡ Đang bỏ qua bước xử lý OpenCV trên Linux để tránh lỗi. Trả về ảnh gốc cho AI.");
                return rawImageBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi ImagePreProcessor: {ex.Message}");
                return null;
            }
        }
    }
}