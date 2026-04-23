@echo off
cd /d "%~dp0"
echo Building...
call npm run build
if errorlevel 1 (
    echo Build failed
    exit /b 1
)
echo Build completed
dir dist /b
exit /b 0