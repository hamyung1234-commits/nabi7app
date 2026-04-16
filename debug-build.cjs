#!/usr/bin/env node
// Debug build script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== NABI Debug Build ===\n');

try {
  console.log('Running vite build with debugging...');
  const output = execSync('npx vite build --debug 2>&1 || echo "Exit code: "$?', { 
    encoding: 'utf8', 
    timeout: 300000,
    maxBuffer: 50 * 1024 * 1024
  });
  console.log(output);
  
  // Check dist folder after build
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n✓ dist folder exists');
    const stats = fs.statSync(distPath);
    console.log(`  isDirectory: ${stats.isDirectory()}`);
  } else {
    console.log('\n✗ dist folder not found');
  }
  
} catch (error) {
  console.log('Error output:', error.stdout || '');
  console.log('Error stderr:', error.stderr || '');
  console.log('Error message:', error.message);
  process.exit(1);
}