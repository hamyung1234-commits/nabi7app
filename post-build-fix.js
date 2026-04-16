import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix asset paths for Surge deployment
// Change /-nabi-app-/ to / for root deployment

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

console.log('Fixing asset paths for Surge deployment...');

// Fix index.html
const indexModified = fixPathsInFile(indexPath, '/-nabi-app-/', '/');
if (indexModified) {
  console.log('Fixed index.html');
} else {
  console.log('index.html already has correct paths or not found');
}

// Fix assets in JS/CSS files
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  processDirectory(assetsPath, '/-nabi-app-/', '/');
}

console.log('Asset path fix completed!');
