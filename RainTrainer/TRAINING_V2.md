# HCMC camera model v2 workflow

The old Internet dataset must not be used for production evaluation. Rain images in that dataset are mostly flooding scenes, while NoRain images come from unrelated dashcams. This creates source leakage and misleading accuracy.

## 1. Collect and review real camera frames

The scanner stores every raw positive, every low-confidence prediction, and a random sample of confident negatives. In the web admin page, open **Audit → Duyệt ảnh training camera thật** and label each image as:

- `Rain`
- `NoRain`
- `Uncertain`
- `InvalidImage`

Only reviewed `Rain` and `NoRain` images are exported to training.

## 2. Download reviewed data

Set these environment variables in the trainer shell:

```powershell
$env:RAIN_TRAINER_ADMIN_TOKEN = "ADMIN_JWT"
$env:RAIN_TRAINER_DATASET_URL = "https://YOUR_BACKEND/api/admin/training-dataset"
$env:RAIN_TRAINER_DATASET_FOLDER = "D:\Downloads\HcmcCameraDataset"
dotnet run --project RainTrainer.csproj
```

Do not put the admin token in source control.

## 3. Dataset acceptance rules

The trainer refuses to run until it has at least:

- 100 reviewed Rain frames;
- 100 reviewed NoRain frames;
- five different HCMC cameras.

For a meaningful production model, target 2,000–5,000 reviewed frames across daytime, night, cloudy weather, wet roads, glare, blurred cameras, light rain, and heavy rain.

Train, validation, and test splits are separated by camera ID. Frames from one camera never appear in more than one split.

## 4. Promotion rule

Do not replace `MLModels/RainModel.zip` based on accuracy alone. Review the confusion matrix and require high Rain recall on held-out cameras. Keep the previous model until the new model passes real-camera shadow testing.
