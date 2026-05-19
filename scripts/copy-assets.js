const fs = require('fs');
const path = require('path');

const srcPublic = path.join(__dirname, '../src/public');
const distPublic = path.join(__dirname, '../dist/public');

if (!fs.existsSync(distPublic)) {
  fs.mkdirSync(distPublic, { recursive: true });
}

try {
  fs.copyFileSync(
    path.join(srcPublic, 'index.html'),
    path.join(distPublic, 'index.html')
  );
  console.log('✅ Static developer portal copied to dist successfully.');
} catch (error) {
  console.error('❌ Failed to copy static assets to dist:', error);
  process.exit(1);
}
