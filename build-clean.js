import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Cleaning dist folder...');
try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('dist folder deleted');
  }
} catch (e) {
  console.log('Could not delete dist:', e.message);
}

console.log('Setting VITE_BASE_URL...');
process.env.VITE_BASE_URL = '/-nabi-app-/';

console.log('Running build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed');
  
  // Read and check index.html
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    console.log('\n--- Built index.html ---');
    if (content.includes('/-nabi-app-/')) {
      console.log('SUCCESS: Base URL is correctly set to /-nabi-app-/');
    } else {
      console.log('FAIL: Base URL is NOT set correctly');
      // Show the relevant lines
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('src=') || line.includes('href=')) {
          console.log(`Line ${i+1}: ${line.trim()}`);
        }
      });
    }
  }
} catch (e) {
  console.error('Build failed:', e.message);
}
