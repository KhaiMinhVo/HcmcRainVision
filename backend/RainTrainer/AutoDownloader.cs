using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace RainTrainer
{
    public static class AutoDownloader
    {
        // 1) Dán token Admin JWT vào đây (không kèm chữ "Bearer")
        private const string AdminToken = "DAN_TOKEN_CUA_BAN_VAO_DAY";

        // 2) API audit data
        private const string ApiUrl = "https://hcmcrainvision-backend-r84u.onrender.com/api/admin/audit-data";

        // 3) Thư mục Dataset gốc (chứa 2 thư mục con Rain/NoRain)
        private const string DatasetFolder = @"D:\Downloads\Dataset";

        public static string GetDatasetFolder() => DatasetFolder;

        public static async Task DownloadAuditImages()
        {
            Console.WriteLine("[AutoDownloader] Dang ket noi server de tai audit data...");

            if (string.IsNullOrWhiteSpace(AdminToken) || AdminToken.Contains("DAN_TOKEN", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("[AutoDownloader] Chua cau hinh AdminToken. Bo qua buoc tai du lieu.");
                return;
            }

            if (!Directory.Exists(DatasetFolder))
            {
                Console.WriteLine($"[AutoDownloader] DatasetFolder khong ton tai: {DatasetFolder}");
                return;
            }

            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromSeconds(60);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AdminToken);

            try
            {
                using var response = await client.GetAsync(ApiUrl);
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[AutoDownloader] Goi API that bai: {(int)response.StatusCode} {response.ReasonPhrase}");
                    return;
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonContent);

                if (document.RootElement.ValueKind != JsonValueKind.Array)
                {
                    Console.WriteLine("[AutoDownloader] Du lieu API khong phai mang JSON, bo qua.");
                    return;
                }

                var downloadedCount = 0;

                foreach (var element in document.RootElement.EnumerateArray())
                {
                    var imageUrl = ReadStringProperty(element, "imageUrl");
                    var userSaid = ReadStringProperty(element, "userSaid");
                    var reportId = ReadReportId(element);

                    if (string.IsNullOrWhiteSpace(imageUrl))
                    {
                        continue;
                    }

                    var targetFolder = string.Equals(userSaid, "Rain", StringComparison.OrdinalIgnoreCase)
                        ? "Rain"
                        : "NoRain";

                    var fullDirPath = Path.Combine(DatasetFolder, targetFolder);
                    Directory.CreateDirectory(fullDirPath);

                    var safeId = string.IsNullOrWhiteSpace(reportId) ? Guid.NewGuid().ToString("N") : reportId;
                    var fileName = $"audit_{safeId}.jpg";
                    var filePath = Path.Combine(fullDirPath, fileName);

                    if (File.Exists(filePath))
                    {
                        continue;
                    }

                    var imageBytes = await client.GetByteArrayAsync(imageUrl);
                    await File.WriteAllBytesAsync(filePath, imageBytes);

                    Console.WriteLine($"[AutoDownloader] Da tai: {fileName} -> {targetFolder}");
                    downloadedCount++;
                }

                if (downloadedCount == 0)
                {
                    Console.WriteLine("[AutoDownloader] Khong co anh moi.");
                }
                else
                {
                    Console.WriteLine($"[AutoDownloader] Hoan tat. Tai moi {downloadedCount} anh.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AutoDownloader] Loi khi tai du lieu: {ex.Message}");
            }
        }

        private static string ReadStringProperty(JsonElement element, string name)
        {
            return element.TryGetProperty(name, out var value)
                ? value.GetString() ?? string.Empty
                : string.Empty;
        }

        private static string ReadReportId(JsonElement element)
        {
            if (!element.TryGetProperty("reportId", out var value))
            {
                return string.Empty;
            }

            if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var intId))
            {
                return intId.ToString();
            }

            if (value.ValueKind == JsonValueKind.String)
            {
                return value.GetString() ?? string.Empty;
            }

            return string.Empty;
        }
    }
}
