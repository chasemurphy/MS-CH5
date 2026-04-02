/**
 * archive.js — Creates a .ch5z archive from the dist/msch5 build output.
 *
 * Structure:
 *   msch5.ch5z
 *   ├── msch5.ch5        (zip of all files in dist/msch5, plus appui/manifest)
 *   └── msch5_manifest.json  (project name, timestamp, sha-256 of .ch5)
 *
 * Usage: node scripts/archive.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PROJECT_NAME = 'msch5';
const DIST_DIR = path.resolve(__dirname, '..', 'dist', PROJECT_NAME);
const OUT_DIR = path.resolve(__dirname, '..', 'dist');
const CH5_FILE = path.join(OUT_DIR, `${PROJECT_NAME}.ch5`);
const CH5Z_FILE = path.join(OUT_DIR, `${PROJECT_NAME}.ch5z`);

// 1. Ensure dist output exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('Build output not found at', DIST_DIR);
  console.error('Run "npm run build:prod" first.');
  process.exit(1);
}

// 2. Create appui/manifest inside dist (required by Crestron panels)
const appuiDir = path.join(DIST_DIR, 'appui');
if (!fs.existsSync(appuiDir)) {
  fs.mkdirSync(appuiDir, { recursive: true });
}
fs.writeFileSync(path.join(appuiDir, 'manifest'), 'apptype:ch5\n');

// 3. Create the inner .ch5 archive (zip of dist contents)
console.log('Creating', PROJECT_NAME + '.ch5 ...');
if (fs.existsSync(CH5_FILE)) fs.unlinkSync(CH5_FILE);

execSync(`cd "${DIST_DIR}" && zip -r "${CH5_FILE}" . -x "*.DS_Store"`, { stdio: 'inherit' });

// 4. Compute SHA-256 of the .ch5 file
const ch5Buffer = fs.readFileSync(CH5_FILE);
const sha256 = crypto.createHash('sha256').update(ch5Buffer).digest('hex');

// 5. Create the manifest JSON
const manifest = {
  projectname: `${PROJECT_NAME}.ch5`,
  modifiedtime: new Date().toISOString(),
  'sha-256': sha256
};

const manifestFile = path.join(OUT_DIR, `${PROJECT_NAME}_manifest.json`);
fs.writeFileSync(manifestFile, JSON.stringify(manifest));
console.log('Manifest:', JSON.stringify(manifest, null, 2));

// 6. Create the outer .ch5z archive
console.log('Creating', PROJECT_NAME + '.ch5z ...');
if (fs.existsSync(CH5Z_FILE)) fs.unlinkSync(CH5Z_FILE);

execSync(`cd "${OUT_DIR}" && zip "${CH5Z_FILE}" "${PROJECT_NAME}.ch5" "${PROJECT_NAME}_manifest.json"`, { stdio: 'inherit' });

// 7. Clean up intermediate files
fs.unlinkSync(CH5_FILE);
fs.unlinkSync(manifestFile);

console.log('\nArchive created:', CH5Z_FILE);
console.log('Size:', (fs.statSync(CH5Z_FILE).size / 1024).toFixed(1) + ' KB');
