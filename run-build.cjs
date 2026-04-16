const { execSync } = require('child_process');
try {
  console.log('Starting build...');
  execSync('node node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
  console.log('Build completed!');
} catch (e) {
  console.error('Build failed:', e.message);
  process.exit(1);
}
