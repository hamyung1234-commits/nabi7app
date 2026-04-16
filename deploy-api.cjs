// Direct Netlify API deployment
const https = require('https');

const TOKEN = 'nfp_GpSDj47xvhjrECQiQvRksgBJ7h7TNxSa7jLF';
const SITE_NAME = 'nabi-assistant-' + Date.now().toString(36);

const options = {
  hostname: 'api.netlify.com',
  path: '/api/sites',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json'
  }
};

console.log('Creating site: ' + SITE_NAME);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 201 || res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log('SUCCESS!');
      console.log('URL:', result.url);
      console.log('Admin:', result.admin_url);
    } else {
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(JSON.stringify({ name: SITE_NAME }));
req.end();