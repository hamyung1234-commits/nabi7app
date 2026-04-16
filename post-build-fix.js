// post-build-fix.js
// Run AFTER vite build to fix asset paths for GitHub Pages subdirectory
// Usage: node post-build-fix.js

import fs from 'fs';
import path from 'path';

const BASE_PATH = '/nabi7app/';

function fixIndexHtml() {
  const indexPath = path.join('dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html not found - run "npm run build" first');
    process.exit(1);
  }
  
  let content = fs.readFileSync(indexPath, 'utf-8');
  
  // Replace /assets/ with /nabi7app/assets/ in script and link tags
  content = content.replace(/src="\/assets\//g, `src="${BASE_PATH}assets/`);
  content = content.replace(/href="\/assets\//g, `href="${BASE_PATH}assets/`);

  // Replace nabi-icon.svg
  content = content.replace(/href="\/nabi-icon\.svg"/g, `href="${BASE_PATH}nabi-icon.svg"`);
  
  fs.writeFileSync(indexPath, content);
  console.log('Fixed index.html asset paths');
}

function fixJsFiles() {
  const assetsDir = path.join('dist', 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('dist/assets not found');
    return;
  }
  
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  
  for (const file of jsFiles) {
    const filePath = path.join(assetsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace /assets/ with /nabi7app/assets/
    let modified = false;
    const newContent = content.replace(/\/assets\//g, (match) => {
      modified = true;
      return `${BASE_PATH}assets/`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed JS file: ${file}`);
    }
  }
}

fixIndexHtml();
fixJsFiles();
console.log('Post-build fix complete!');
