# Deploy Script
# Run this to deploy to GitHub Pages

@echo off
echo Starting deployment...

# Build the project
echo Building...
call npm run build

# Check if build succeeded
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    exit /b 1
)

# Open GitHub Pages settings
echo.
echo ============================================
echo NEXT STEP: Go to GitHub Pages settings
echo to enable deployment
echo ============================================
echo.
echo 1. Go to: https://github.com/hamyung1234-commits/-nabi-app-/settings/pages
echo 2. Select "GitHub Actions" as source
echo 3. Save
echo.
echo Your site will be available at:
echo https://hamyung1234-commits.github.io/-nabi-app-/
echo.

pause