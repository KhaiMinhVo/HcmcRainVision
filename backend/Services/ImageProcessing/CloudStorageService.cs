using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace HcmcRainVision.Backend.Services.ImageProcessing
{
    public interface ICloudStorageService
    {
        Task<string?> UploadImageAsync(byte[] imageBytes, string fileName);
    }

    /// <summary>
    /// Service để upload ảnh lên Cloudinary
    /// Thay thế việc lưu ảnh local để tránh đầy ổ cứng
    /// </summary>
    public class CloudStorageService : ICloudStorageService
    {
        private readonly Cloudinary? _cloudinary;
        private readonly ILogger<CloudStorageService> _logger;
        private readonly bool _isEnabled;

        public CloudStorageService(IConfiguration config, ILogger<CloudStorageService> logger)
        {
            _logger = logger;
            
            var cloudName = config["CloudinarySettings:CloudName"];
            var apiKey = config["CloudinarySettings:ApiKey"];
            var apiSecret = config["CloudinarySettings:ApiSecret"];

            // Kiểm tra xem Cloudinary có được cấu hình không
            _isEnabled = !string.IsNullOrEmpty(cloudName) && 
                         !string.IsNullOrEmpty(apiKey) && 
                         !string.IsNullOrEmpty(apiSecret);

            if (_isEnabled)
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                _cloudinary = new Cloudinary(account);
                _logger.LogInformation("✅ Cloudinary đã được khởi tạo thành công");
            }
            else
            {
                _logger.LogWarning("⚠️ Cloudinary chưa được cấu hình. Sẽ fallback sang lưu local.");
            }
        }

        public async Task<string?> UploadImageAsync(byte[] imageBytes, string fileName)
        {
            if (!_isEnabled)
            {
                _logger.LogWarning("Cloudinary không khả dụng, bỏ qua upload");
                return null;
            }

            try
            {
                using var stream = new MemoryStream(imageBytes);
                
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(fileName, stream),
                    Folder = "hcmc_rain_vision/rain_logs",
                    PublicId = Path.GetFileNameWithoutExtension(fileName),
                    Overwrite = false,
                    UseFilename = true
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    _logger.LogInformation($"✅ Upload thành công: {uploadResult.SecureUrl}");
                    return uploadResult.SecureUrl.ToString();
                }
                else
                {
                    _logger.LogError($"❌ Upload thất bại: {uploadResult.Error?.Message}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Lỗi khi upload ảnh lên Cloudinary: {ex.Message}");
                return null;
            }
        }
    }
}
