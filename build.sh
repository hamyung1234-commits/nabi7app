#!/bin/bash
# Build script for GitHub Actions
set -e

echo "Starting build..."
npm ci
npm run build

# Fix asset paths for GitHub Pages (no subdirectory)
if [ -f "post-build-fix.js" ]; then
  node post-build-fix.js
fi

echo "Build completed successfully!"