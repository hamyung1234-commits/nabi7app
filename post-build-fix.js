import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix asset paths for GitHub Pages deployment (nabi-app repository)
// Ensure all assets use /nabi-app/ prefix correctly

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

function fixPathsInFile(filePath, oldPath, newPath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  if (content.includes(oldPath)) {
    content = content.split(oldPath).join(newPath);
    fs.writeFileSync(filePath, content);
    modified = true;
  }

  return modified;
}

function processDirectory(dirPath, oldPath, newPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, oldPath, newPath);
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      const modified = fixPathsInFile(filePath, oldPath, newPath);
      if (modified) {
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
}

console.log('Fixing asset paths for nabi-app GitHub Pages deployment...');

// Fix index.html - ensure /nabi-app/ prefix is correct
// Replace /-nabi-app-/ with /nabi-app/
const indexModified = fixPathsInFile(indexPath, '/-nabi-app-/', '/nabi-app/');
if (indexModified) {
  console.log('Fixed index.html - corrected subdirectory prefix to /nabi-app/');
} else {
  console.log('index.html - checking for /assets/ paths to update...');
  // Also fix /assets/ to /nabi-app/assets/
  const indexModified2 = fixPathsInFile(indexPath, '"/assets/', '"/nabi-app/assets/');
  if (indexModified2) {
    console.log('Fixed index.html - updated /assets/ to /nabi-app/assets/');
  } else {
    console.log('index.html already has correct paths');
  }
}

// Fix any remaining incorrect paths in assets
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  // Fix /-nabi-app-/ paths
  processDirectory(assetsPath, '/-nabi-app-/', '/nabi-app/');
  // Fix /assets/ paths  
  processDirectory(assetsPath, '/assets/', '/nabi-app/assets/');
}

console.log('Asset path fix completed for nabi-app!');
