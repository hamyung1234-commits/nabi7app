@echo off
REM Build script for Windows
call npm install
call npm run build
call node post-build-fix.js
echo Build complete