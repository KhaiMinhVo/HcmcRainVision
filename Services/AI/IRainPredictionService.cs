namespace HcmcRainVision.Backend.Services.AI
{
    /// <summary>
    /// Interface cho dịch vụ dự đoán mưa
    /// </summary>
    public interface IRainPredictionService
    {
        /// <summary>
        /// Dự đoán trạng thái mưa từ ảnh
        /// </summary>
        /// <param name="imageBytes">Dữ liệu ảnh dạng byte array</param>
        /// <returns>Kết quả dự đoán</returns>
        RainPredictionResult Predict(byte[] imageBytes);
    }
}
