using OpenCvSharp;

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
                if (rawImageBytes.Length == 0) return null;

                using var decoded = Cv2.ImDecode(rawImageBytes, ImreadModes.Color);
                if (decoded.Empty()) return null;

                // Camera giao thông thường chèn timestamp/logo ở mép dưới.
                var usableHeight = Math.Max(1, (int)Math.Round(decoded.Height * 0.92));
                using var cropped = new Mat(decoded, new Rect(0, 0, decoded.Width, usableHeight));

                var scale = Math.Min((double)targetWidth / cropped.Width, (double)targetHeight / cropped.Height);
                var resizedWidth = Math.Max(1, (int)Math.Round(cropped.Width * scale));
                var resizedHeight = Math.Max(1, (int)Math.Round(cropped.Height * scale));
                using var resized = new Mat();
                Cv2.Resize(cropped, resized, new Size(resizedWidth, resizedHeight), 0, 0, InterpolationFlags.Area);

                using var normalized = new Mat(new Size(targetWidth, targetHeight), MatType.CV_8UC3, Scalar.Black);
                var offsetX = (targetWidth - resizedWidth) / 2;
                var offsetY = (targetHeight - resizedHeight) / 2;
                using (var destination = new Mat(normalized, new Rect(offsetX, offsetY, resizedWidth, resizedHeight)))
                {
                    resized.CopyTo(destination);
                }

                Cv2.ImEncode(".jpg", normalized, out var output, new ImageEncodingParam(ImwriteFlags.JpegQuality, 92));
                return output;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi chuẩn hóa ảnh cho AI");
                return null;
            }
        }
    }
}
