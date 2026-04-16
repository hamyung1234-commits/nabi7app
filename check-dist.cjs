#!/usr/bin/env node
// Check if dist exists and build timing
const fs = require('fs');
const path = require('path');

console.log('Checking dist directory...');
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  const stats = fs.statSync(distPath);
  console.log('dist exists, modified:', stats.mtime);
  
  // Check if files exist
  const files = fs.readdirSync(distPath);
  console.log('Files in dist:', files.length);
  
  // Check index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8');
    if (content.includes('/nabi7app/')) {
      console.log('✓ index.html has correct /nabi7app/ paths');
    } else {
      console.log('✗ index.html missing /nabi7app/ paths');
    }
  } else {
    console.log('✗ index.html not found');
  }
} else {
  console.log('dist does not exist - need to build');
}

// Try to run vite build with more timeout
console.log('\nAttempting build with extended timeout...');

const { spawn } = require('child_process');

const vite = spawn('node', ['node_modules/vite/bin/vite.js', 'build'], {
  stdio: 'inherit',
  cwd: __dirname
});

vite.on('close', (code) => {
  console.log('\nVite process exited with code:', code);
  
  // Check dist again
  if (fs.existsSync(distPath)) {
    console.log('Build completed! dist exists.');
  }
});

vite.on('error', (err) => {
  console.error('Error:', err);
});