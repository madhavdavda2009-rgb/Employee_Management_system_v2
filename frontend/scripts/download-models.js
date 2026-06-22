import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, '..', 'public', 'models');
const baseURL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

let downloaded = 0;

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename);
    const url = `${baseURL}/${filename}`;
    
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          const file = fs.createWriteStream(filePath);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            downloaded++;
            console.log(`✓ Downloaded ${filename} (${downloaded}/${models.length})`);
            resolve();
          });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          downloaded++;
          console.log(`✓ Downloaded ${filename} (${downloaded}/${models.length})`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAllModels() {
  console.log('Downloading face-api.js models...\n');
  
  try {
    for (const model of models) {
      await downloadFile(model);
    }
    console.log('\n✓ All models downloaded successfully!');
  } catch (error) {
    console.error('\n✗ Error downloading models:', error.message);
    process.exit(1);
  }
}

downloadAllModels();
