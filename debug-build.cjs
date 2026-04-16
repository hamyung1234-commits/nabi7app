#!/usr/bin/env node
// Debug build script
const { spawn } = require('child_process');

console.log('Starting debug build...');

const child = spawn('npx', ['vite', 'build', '--debug'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  const text = data.toString();
  stdout += text;
  process.stdout.write(text);
});

child.stderr.on('data', (data) => {
  const text = data.toString();
  stderr += text;
  process.stderr.write(text);
});

child.on('close', (code) => {
  console.log('\n--- Build finished with code:', code);
  console.log('stdout length:', stdout.length);
  console.log('stderr length:', stderr.length);
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Spawn error:', err);
  process.exit(1);
});

// Timeout after 5 minutes
setTimeout(() => {
  console.log('Build timeout - killing process');
  child.kill();
  process.exit(1);
}, 300000);