// Direct Netlify API deployment
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'nfp_GpSDj47xvhjrECQiQvRksgBJ7h7TNxSa7jLF';
const SITE_NAME = 'nabi-assistant-' + Date.now();

const options = {
  hostname: 'api.netlify.com',
  path: '/api/sites',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔄 Creating Netlify site...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 201 || res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log('\n✅ Site created!');
      console.log('Admin URL:', result.admin_url);
      console.log('URL:', result.url);
    } else {
      console.log('\n⚠️ Site creation failed');
      console.log('Please use: https://app.netlify.com/drop');
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  console.log('\nAlternative: Go to https://app.netlify.com/drop');
});

req.write(JSON.stringify({ name: SITE_NAME }));
req.end();