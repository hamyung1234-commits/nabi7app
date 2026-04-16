const fs = require('fs');
const distPath = './dist';

console.log('Checking dist folder...');

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('dist folder contents:');
  files.forEach(f => console.log(`  - ${f}`));
  
  // Check index.html
  const indexPath = './dist/index.html';
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    console.log('\nindex.html size:', content.length, 'bytes');
    console.log('First 500 chars:', content.substring(0, 500));
  }
} else {
  console.log('dist folder NOT found!');
}