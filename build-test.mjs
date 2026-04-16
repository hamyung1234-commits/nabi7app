// Build script - runs vite build with explicit options
import { createServer } from 'vite';

console.log('Starting build process...');

// Use vite build programmatically
import('./node_modules/vite/dist/node/cli.js').then(vite => {
  console.log('Vite loaded');
}).catch(err => {
  console.error('Failed to load vite:', err);
});