import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix asset paths for GitHub Pages deployment
// Update from old /-nabi-app-/ path to new /nabi7app/ path

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
  if (!fs.existsSync(dirPath)) return;
  
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

console.log('Fixing asset paths for nabi7app GitHub Pages deployment...');

// Fix index.html - update paths from old /-nabi-app-/ to /nabi7app/
fixPathsInFile(indexPath, '/-nabi-app-/', '/nabi7app/');
console.log('Fixed index.html paths');

// Fix any remaining incorrect paths in assets
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  processDirectory(assetsPath, '/-nabi-app-/', '/nabi7app/');
}

console.log('Asset path fix completed for nabi7app!');