@echo off
echo Starting build with debug...
node node_modules/vite/bin/vite.js build --config vite.config.debug.ts --minify false --logLevel info > build_debug.log 2>&1
echo Exit code: %ERRORLEVEL% >> build_debug.log
echo. >> build_debug.log
echo Build finished. Check dist folder.
dir dist /s /b >> build_debug.log 2>&1
type build_debug.log