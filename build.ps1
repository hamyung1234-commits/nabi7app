$ErrorActionPreference = "Stop"
$projectDir = "C:\Users\aaas noh jang hyub\BlueforgeProjects\나의비서"

Write-Host "Starting build..."
Set-Location $projectDir

# Remove old dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Run build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE"
    exit 1
}

Write-Host "Build completed successfully"
Write-Host "Files in dist:"
Get-ChildItem -Recurse dist
