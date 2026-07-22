using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Vision;
using OpenCvSharp;
using System.Text.Json;

namespace RainTrainer;

public class ModelInput
{
    public byte[] Image { get; set; } = Array.Empty<byte>();
    public string Label { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}

internal sealed record TrainingReport(
    DateTime TrainedAtUtc,
    int TrainCount,
    int ValidationCount,
    int TestCount,
    double MicroAccuracy,
    double MacroAccuracy,
    double LogLoss,
    IReadOnlyList<string> Labels,
    IReadOnlyList<IReadOnlyList<double>> ConfusionMatrix);

internal static class Program
{
    private const int Seed = 20260722;

    private static async Task Main()
    {
        await AutoDownloader.DownloadAuditImages();

        var datasetFolder = AutoDownloader.GetDatasetFolder();
        if (!Directory.Exists(datasetFolder))
        {
            Console.WriteLine($"Dataset không tồn tại: {datasetFolder}");
            return;
        }

        Console.WriteLine("Đang đọc và chuẩn hóa ảnh...");
        var images = LoadImagesFromFolder(datasetFolder).ToList();
        var rainCount = images.Count(x => x.Label == "Rain");
        var noRainCount = images.Count(x => x.Label == "NoRain");
        Console.WriteLine($"Rain: {rainCount}; NoRain: {noRainCount}");
        if (rainCount < 20 || noRainCount < 20)
        {
            Console.WriteLine("Mỗi nhãn cần tối thiểu 20 ảnh để train/evaluate.");
            return;
        }

        var (trainRows, validationRows, testRows) = StratifiedSplit(images);
        Console.WriteLine($"Train: {trainRows.Count}; Validation: {validationRows.Count}; Test: {testRows.Count}");

        var ml = new MLContext(seed: Seed);
        var trainData = ml.Data.LoadFromEnumerable(trainRows);
        var validationData = ml.Data.LoadFromEnumerable(validationRows);
        var testData = ml.Data.LoadFromEnumerable(testRows);
        var labelMapping = ml.Transforms.Conversion.MapValueToKey("LabelAsKey", nameof(ModelInput.Label));
        var labelMappingTransformer = labelMapping.Fit(trainData);
        var keyedValidationData = labelMappingTransformer.Transform(validationData);
        var workspace = Path.Combine(Path.GetTempPath(), "HcmcRainVisionTrainer");
        Directory.CreateDirectory(workspace);

        var options = new ImageClassificationTrainer.Options
        {
            FeatureColumnName = nameof(ModelInput.Image),
            LabelColumnName = "LabelAsKey",
            ValidationSet = keyedValidationData,
            Arch = ImageClassificationTrainer.Architecture.ResnetV250,
            Epoch = 30,
            BatchSize = 16,
            LearningRate = 0.01f,
            WorkspacePath = workspace,
            ReuseTrainSetBottleneckCachedValues = true,
            ReuseValidationSetBottleneckCachedValues = true,
        };

        var pipeline = labelMapping
            .Append(ml.MulticlassClassification.Trainers.ImageClassification(options))
            .Append(ml.Transforms.Conversion.MapKeyToValue("PredictedLabel"));

        Console.WriteLine("Bắt đầu huấn luyện...");
        var model = pipeline.Fit(trainData);
        var predictions = model.Transform(testData);
        var metrics = ml.MulticlassClassification.Evaluate(predictions, labelColumnName: "LabelAsKey");

        Console.WriteLine($"TEST micro accuracy: {metrics.MicroAccuracy:P2}");
        Console.WriteLine($"TEST macro accuracy: {metrics.MacroAccuracy:P2}");
        Console.WriteLine($"TEST log loss: {metrics.LogLoss:F4}");
        Console.WriteLine(metrics.ConfusionMatrix.GetFormattedConfusionTable());

        const string modelPath = "RainModel.zip";
        ml.Model.Save(model, trainData.Schema, modelPath);

        var matrix = metrics.ConfusionMatrix.Counts
            .Select(row => (IReadOnlyList<double>)row.Select(value => (double)value).ToList())
            .ToList();
        var report = new TrainingReport(
            DateTime.UtcNow,
            trainRows.Count,
            validationRows.Count,
            testRows.Count,
            metrics.MicroAccuracy,
            metrics.MacroAccuracy,
            metrics.LogLoss,
            new[] { "NoRain", "Rain" },
            matrix);
        await File.WriteAllTextAsync("TrainingMetrics.json", JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"Đã lưu {modelPath} và TrainingMetrics.json");
    }

    private static (List<ModelInput> Train, List<ModelInput> Validation, List<ModelInput> Test) StratifiedSplit(List<ModelInput> images)
    {
        var random = new Random(Seed);
        var train = new List<ModelInput>();
        var validation = new List<ModelInput>();
        var test = new List<ModelInput>();

        foreach (var group in images.GroupBy(x => x.Label))
        {
            var rows = group.OrderBy(_ => random.Next()).ToList();
            var trainEnd = (int)Math.Floor(rows.Count * 0.70);
            var validationEnd = trainEnd + (int)Math.Floor(rows.Count * 0.15);
            train.AddRange(rows[..trainEnd]);
            validation.AddRange(rows[trainEnd..validationEnd]);
            test.AddRange(rows[validationEnd..]);
        }
        return (train.OrderBy(_ => random.Next()).ToList(), validation, test);
    }

    private static IEnumerable<ModelInput> LoadImagesFromFolder(string folder)
    {
        var files = Directory.GetFiles(folder, "*.*", SearchOption.AllDirectories)
            .Where(file => file.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
                || file.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
                || file.EndsWith(".png", StringComparison.OrdinalIgnoreCase));

        foreach (var file in files)
        {
            var directoryLabel = Directory.GetParent(file)?.Name ?? string.Empty;
            var label = directoryLabel.Equals("Rain", StringComparison.OrdinalIgnoreCase) ? "Rain"
                : directoryLabel.Replace(" ", string.Empty).Equals("NoRain", StringComparison.OrdinalIgnoreCase) ? "NoRain"
                : null;
            if (label == null) continue;

            var normalized = NormalizeImage(File.ReadAllBytes(file));
            if (normalized == null)
            {
                Console.WriteLine($"Bỏ qua ảnh hỏng: {file}");
                continue;
            }
            yield return new ModelInput { Image = normalized, Label = label, Source = file };
        }
    }

    private static byte[]? NormalizeImage(byte[] bytes, int targetWidth = 224, int targetHeight = 224)
    {
        try
        {
            using var decoded = Cv2.ImDecode(bytes, ImreadModes.Color);
            if (decoded.Empty()) return null;
            var usableHeight = Math.Max(1, (int)Math.Round(decoded.Height * 0.92));
            using var cropped = new Mat(decoded, new Rect(0, 0, decoded.Width, usableHeight));
            var scale = Math.Min((double)targetWidth / cropped.Width, (double)targetHeight / cropped.Height);
            var width = Math.Max(1, (int)Math.Round(cropped.Width * scale));
            var height = Math.Max(1, (int)Math.Round(cropped.Height * scale));
            using var resized = new Mat();
            Cv2.Resize(cropped, resized, new Size(width, height), 0, 0, InterpolationFlags.Area);
            using var canvas = new Mat(new Size(targetWidth, targetHeight), MatType.CV_8UC3, Scalar.Black);
            using (var destination = new Mat(canvas, new Rect((targetWidth - width) / 2, (targetHeight - height) / 2, width, height)))
            {
                resized.CopyTo(destination);
            }
            Cv2.ImEncode(".jpg", canvas, out var output, new ImageEncodingParam(ImwriteFlags.JpegQuality, 92));
            return output;
        }
        catch
        {
            return null;
        }
    }
}
