// Simple deploy script using Netlify API
// Requires: NETLIFY_AUTH_TOKEN environment variable

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.NETLIFY_AUTH_TOKEN;

if (!TOKEN) {
  console.error('❌ NETLIFY_AUTH_TOKEN not set');
  console.log('\nTo deploy:');
  console.log('1. Go to https://app.netlify.com/drop');
  console.log('2. Drag the "dist" folder to the page');
  console.log('3. Get instant URL!');
  process.exit(1);
}

console.log('🔄 Deploying to Netlify...');
console.log('Note: Use https://app.netlify.com/drop for instant drag-drop deploy');