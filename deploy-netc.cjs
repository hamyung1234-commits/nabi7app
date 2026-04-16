// Netlify Deploy Script v2
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = 'nfp_GpSDj47xvhjrECQiQvRksgBJ7h7TNxSa7jLF';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function deploy() {
  console.log('🔄 Deploying to Netlify...\n');

  // Step 1: Create new site
  console.log('1. Creating new site...');
  const siteName = 'nabi-' + Date.now().toString(36);
  const createResult = await makeRequest('POST', '/api/v1/sites', { name: siteName });
  console.log('   Status:', createResult.status);

  if (createResult.status === 201 || createResult.status === 200) {
    const site = createResult.data;
    console.log('   ✅ Site created!');
    console.log('   URL:', site.url);
    console.log('   Admin:', site.admin_url);
    console.log('   Site ID:', site.id);
  } else if (createResult.status === 404) {
    console.log('   ❌ API endpoint not found - Token may be invalid');
    console.log('   \nFallback: Use https://app.netlify.com/drop');
  } else {
    console.log('   Response:', JSON.stringify(createResult.data).substring(0, 300));
  }
}

deploy().catch(console.error);