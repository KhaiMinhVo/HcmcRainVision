using System.Globalization;
using System.Text;

namespace HcmcRainVision.Backend.Utils
{
    /// <summary>
    /// Utility functions cho xử lý chuỗi
    /// </summary>
    public static class StringUtils
    {
        /// <summary>
        /// Chuẩn hóa tên thành mã code (loại bỏ dấu, khoảng trắng)
        /// Ví dụ: "Quận 1" -> "quan_1", "Bình Thạnh" -> "binh_thanh"
        /// Dùng cho SignalR Group names, API paths, etc.
        /// </summary>
        /// <param name="input">Chuỗi đầu vào có thể có dấu tiếng Việt</param>
        /// <returns>Chuỗi đã chuẩn hóa: lowercase, không dấu, dùng underscore</returns>
        public static string NormalizeCode(string? input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "unknown";
            
            // Bước 1: Chuyển thành NFD (Normalization Form D) để tách dấu khỏi ký tự
            // Ví dụ: "ệ" -> "e" + "̣" + "̀"
            string normalized = input.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            // Bước 2: Lọc bỏ các ký tự dấu (NonSpacingMark)
            foreach (var c in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            // Bước 3: Chuyển về NFC (Normalization Form C), lowercase, thay thế khoảng trắng/dấu gạch ngang
            return stringBuilder.ToString()
                                .Normalize(NormalizationForm.FormC)
                                .ToLowerInvariant()
                                .Replace(" ", "_")
                                .Replace("-", "_");
        }
    }
}
