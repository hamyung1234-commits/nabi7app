import fs from 'fs';
import path from 'path';

const basePath = '/-nabi-app-/';
const distDir = path.join(process.cwd(), 'dist');

function fixFile(filePath) {
  console.log(`Fixing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixed = false;
  
  // Fix absolute asset paths: /assets/... -> /-nabi-app-/assets/...
  const assetPattern = /"\/assets\//g;
  if (assetPattern.test(content)) {
    content = content.replace(/"\/assets\//g, `"${basePath}assets/`);
    console.log(`  ✓ Fixed /assets/ paths`);
    fixed = true;
  }
  
  // Fix absolute favicon path: /nabi-icon.svg -> /-nabi-app-/nabi-icon.svg
  if (content.includes('"/nabi-icon.svg"')) {
    content = content.replace('"/nabi-icon.svg"', `"${basePath}nabi-icon.svg"`);
    console.log(`  ✓ Fixed /nabi-icon.svg path`);
    fixed = true;
  }
  
  // Fix root path references
  if (content.includes('"/"') || content.includes("'/'")) {
    // Replace "/" with basePath only in specific contexts
    content = content.replace(/="\//g, `="${basePath}`);
    console.log(`  ✓ Fixed root path references`);
    fixed = true;
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Saved changes`);
  } else {
    console.log(`  - No changes needed`);
  }
  
  return fixed;
}

console.log('=== Post-build fix for GitHub Pages ===\n');
console.log(`Base path: ${basePath}\n`);

// Fix index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  fixFile(indexPath);
} else {
  console.error('ERROR: dist/index.html not found!');
  process.exit(1);
}

// Fix all JS files
const jsFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.endsWith('.js'));
for (const jsFile of jsFiles) {
  fixFile(path.join(distDir, 'assets', jsFile));
}

// Fix all CSS files
const cssFiles = fs.readdirSync(path.join(distDir, 'assets')).filter(f => f.endsWith('.css'));
for (const cssFile of cssFiles) {
  fixFile(path.join(distDir, 'assets', cssFile));
}

console.log('\n=== Verification ===');
const finalContent = fs.readFileSync(indexPath, 'utf-8');
console.log('\nFinal index.html asset references:');
const lines = finalContent.split('\n');
lines.forEach((line, i) => {
  if (line.includes('src=') || line.includes('href=')) {
    console.log(`  Line ${i + 1}: ${line.trim()}`);
  }
});

if (finalContent.includes(basePath)) {
  console.log('\n✅ SUCCESS: Base path correctly applied!');
} else {
  console.log('\n❌ FAIL: Base path NOT found in index.html');
}
