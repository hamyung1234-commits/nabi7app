import { build } from 'vite';

async function doBuild() {
  console.log('Cleaning dist folder...');
  const fs = await import('fs');
  try {
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
      console.log('dist deleted');
    }
  } catch (e) {
    console.log('Clean error:', e.message);
  }

  console.log('Building...');
  try {
    await build();
    console.log('Build completed!');
    
    if (fs.existsSync('dist/index.html')) {
      const html = fs.readFileSync('dist/index.html', 'utf-8');
      if (html.includes('/-nabi-app-/')) {
        console.log('WARNING: Still has old base path!');
      } else {
        console.log('SUCCESS: Correct base path (/)');
      }
    }
  } catch (e) {
    console.error('Build error:', e);
  }
}

doBuild();
