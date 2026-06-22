# EMS Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Download face-api.js models:

Create a `public/models` directory and download these files from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Required files:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2

3. Start development server:
```bash
npm run dev
```

## Face Recognition

The app uses face-api.js for browser-based face recognition. Models are loaded from the `/models` directory on first use.
