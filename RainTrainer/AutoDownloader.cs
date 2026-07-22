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
        private static readonly string AdminToken = Environment.GetEnvironmentVariable("RAIN_TRAINER_ADMIN_TOKEN") ?? string.Empty;

        // 2) API audit data
        private static readonly string ApiUrl = Environment.GetEnvironmentVariable("RAIN_TRAINER_DATASET_URL")
            ?? "https://hcmc-rain-vision-api-209847686834.asia-southeast1.run.app/api/admin/training-dataset";

        // 3) Thư mục Dataset gốc (chứa 2 thư mục con Rain/NoRain)
        private static readonly string DatasetFolder = Environment.GetEnvironmentVariable("RAIN_TRAINER_DATASET_FOLDER")
            ?? @"D:\Downloads\HcmcCameraDataset";

        public static string GetDatasetFolder() => DatasetFolder;

        public static async Task DownloadAuditImages()
        {
            Console.WriteLine("[AutoDownloader] Dang ket noi server de tai audit data...");

            if (string.IsNullOrWhiteSpace(AdminToken))
            {
                Console.WriteLine("[AutoDownloader] Chua cau hinh AdminToken. Bo qua buoc tai du lieu.");
                return;
            }

            Directory.CreateDirectory(DatasetFolder);

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
                    var label = ReadStringProperty(element, "label");
                    var cameraId = ReadStringProperty(element, "cameraId");
                    var reviewId = ReadId(element, "reviewId");

                    if (string.IsNullOrWhiteSpace(imageUrl))
                    {
                        continue;
                    }

                    if (!label.Equals("Rain", StringComparison.OrdinalIgnoreCase)
                        && !label.Equals("NoRain", StringComparison.OrdinalIgnoreCase)) continue;
                    var targetFolder = label.Equals("Rain", StringComparison.OrdinalIgnoreCase) ? "Rain" : "NoRain";

                    var fullDirPath = Path.Combine(DatasetFolder, targetFolder);
                    Directory.CreateDirectory(fullDirPath);

                    var safeId = string.IsNullOrWhiteSpace(reviewId) ? Guid.NewGuid().ToString("N") : reviewId;
                    var safeCameraId = string.Concat(cameraId.Select(ch => char.IsLetterOrDigit(ch) || ch == '_' || ch == '-' ? ch : '_'));
                    var fileName = $"{safeCameraId}__review_{safeId}.jpg";
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

        private static string ReadId(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var value))
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
