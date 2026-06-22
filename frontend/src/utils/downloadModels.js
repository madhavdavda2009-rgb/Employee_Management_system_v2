// Script to download face-api.js models
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const baseURL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

console.log('Download these files to public/models/:');
models.forEach(model => {
  console.log(`${baseURL}/${model}`);
});
