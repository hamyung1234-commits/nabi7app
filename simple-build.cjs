#!/usr/bin/env node
// Simple build script
const { execSync } = require('child_process');

console.log('Building Vite project...');
try {
  execSync('npx vite build', { 
    stdio: 'inherit',
    timeout: 180000 
  });
  console.log('Build completed!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Run post-build fix
console.log('Running post-build fix...');
try {
  execSync('node post-build-fix.js', { 
    stdio: 'inherit' 
  });
  console.log('Post-build fix completed!');
} catch (error) {
  console.error('Post-build fix failed:', error.message);
  process.exit(1);
}

console.log('All done!');