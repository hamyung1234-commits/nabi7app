import fs from 'fs';
import { execSync } from 'child_process';

console.log('Cleaning dist folder...');
try {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('dist folder deleted');
} catch (e) {
  console.log('Could not delete dist:', e.message);
}

console.log('Running build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed');
} catch (e) {
  console.error('Build failed:', e.message);
  process.exit(1);
}
