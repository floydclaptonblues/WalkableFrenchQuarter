@echo off
setlocal
title French Quarter Walkable World
cd /d "%~dp0"

echo Starting French Quarter Walkable World...
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 1 >nul && start http://localhost:8000"
  py -m http.server 8000
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "timeout /t 1 >nul && start http://localhost:8000"
  python -m http.server 8000
  goto :eof
)

echo Python was not found, so opening index.html directly.
echo This self-contained edition should still run if your browser can load Three.js from the internet.
start "" "%~dp0index.html"
pause
