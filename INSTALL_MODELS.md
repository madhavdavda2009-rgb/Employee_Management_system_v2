# Installing Face-API.js Models

## Automatic Installation (Recommended)

```bash
cd frontend
npm run download-models
```

This script automatically downloads all required models to `frontend/public/models/`.

## Manual Installation

### Option 1: Direct Download

1. Create directory:
```bash
mkdir frontend\public\models
```

2. Download these files from GitHub:
   https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Required files:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

3. Save all files to `frontend/public/models/`

### Option 2: Using wget (Git Bash/WSL)

```bash
cd frontend/public
mkdir models
cd models

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

wget $BASE_URL/tiny_face_detector_model-weights_manifest.json
wget $BASE_URL/tiny_face_detector_model-shard1
wget $BASE_URL/face_landmark_68_model-weights_manifest.json
wget $BASE_URL/face_landmark_68_model-shard1
wget $BASE_URL/face_recognition_model-weights_manifest.json
wget $BASE_URL/face_recognition_model-shard1
wget $BASE_URL/face_recognition_model-shard2
```

### Option 3: Using PowerShell

```powershell
cd frontend\public
New-Item -ItemType Directory -Force -Path models
cd models

$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

foreach ($file in $files) {
    Write-Host "Downloading $file..."
    Invoke-WebRequest -Uri "$baseUrl/$file" -OutFile $file
}

Write-Host "All models downloaded!"
```

## Verify Installation

Check that these files exist in `frontend/public/models/`:

```bash
dir frontend\public\models
```

You should see all 7 files listed above.

## Troubleshooting

### Models not loading in browser
- Clear browser cache
- Check browser console for errors
- Verify all 7 files are present
- Ensure file names match exactly (case-sensitive)

### Download fails
- Check internet connection
- Try manual download from GitHub
- Use VPN if GitHub is blocked

## Model Details

- **tiny_face_detector**: Fast face detection (smaller, faster)
- **face_landmark_68**: 68-point facial landmark detection
- **face_recognition**: 128-dimension face descriptor generation

Total size: ~6-7 MB
