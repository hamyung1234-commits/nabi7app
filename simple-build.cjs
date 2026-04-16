#!/usr/bin/env node
// Simple cross-platform build script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== NABI Build Script ===\n');

try {
  // Step 1: Install dependencies
  console.log('1. Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 2: Build with Vite (capture output separately)
  console.log('\n2. Building with Vite...');
  try {
    const output = execSync('npx vite build 2>&1', { encoding: 'utf8', timeout: 300000 });
    console.log(output);
  } catch (e) {
    console.log('Vite output:', e.stdout || e.message);
    throw e;
  }
  
  // Step 3: Check dist folder
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n✓ dist folder created successfully');
    const files = fs.readdirSync(distPath);
    console.log(`  - ${files.length} files/folders in dist`);
  } else {
    console.log('\n✗ dist folder not created');
    // List what was created
    const dir = fs.readdirSync(__dirname);
    console.log('Available files:', dir.join(', '));
    throw new Error('dist not created');
  }
  
  // Step 4: Fix asset paths (post-build-fix.js)
  if (fs.existsSync(path.join(__dirname, 'post-build-fix.js'))) {
    console.log('\n3. Fixing asset paths...');
    execSync('node post-build-fix.js', { stdio: 'inherit' });
  }
  
  console.log('\n=== Build completed successfully! ===');
  
} catch (error) {
  console.error('\n✗ Build failed:', error.message);
  process.exit(1);
}