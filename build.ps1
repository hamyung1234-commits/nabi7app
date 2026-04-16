$ErrorActionPreference = "Stop"
Write-Host "Starting build..."

try {
    $result = & node node_modules/vite/bin/vite.js build 2>&1
    Write-Host $result
    Write-Host "Build completed!"
} catch {
    Write-Host "Build failed: $_"
    exit 1
}
