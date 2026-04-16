import { execSync } from 'child_process';
console.log('Starting build...');
try {
  execSync('node node_modules/vite/bin/vite.js build', { stdio: 'inherit', shell: true });
  console.log('Build completed!');
} catch (e) {
  console.error('Build failed');
  process.exit(1);
}
