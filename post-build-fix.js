const fs = require('fs');
const path = require('path');

// GitHub Pages uses /-nabi-app-/ subdirectory
// Vite config already handles this via base: '/-nabi-app-/'
// This script can be used for other post-build fixes if needed

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('Build completed successfully - asset paths already configured by Vite');
} else {
  console.error('Build output not found at', indexPath);
  process.exit(1);
}