"use strict";

import * as vite from 'vite';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building project with Vite...');

try {
  const result = vite.build({
    configFile: path.join(__dirname, 'vite.config.ts'),
    root: __dirname,
    build: {
      outDir: path.join(__dirname, 'dist'),
    },
  });
  
  result.then(() => {
    console.log('Build completed successfully!');
  }).catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('Build error:', err);
  process.exit(1);
}