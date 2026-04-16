const fs = require('fs');
const content = fs.readFileSync('src/lib/searchIndex.ts', 'utf8');
const lines = content.split('\n');
for (let i = 151; i < 160 && i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i]);
}
if (content.includes('return true')) {
  console.log('\n✓ Found "return true" in isSupabaseConfigured');
} else {
  console.log('\n✗ "return true" NOT found');
}
