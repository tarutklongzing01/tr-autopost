@echo off
setlocal
title FB AutoPost Lite
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo Warning: .env.local was not found.
  echo Create it before connecting Firebase or Facebook.
  pause
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting FB AutoPost Lite...
start "" http://localhost:3000
call npm.cmd run dev

if errorlevel 1 (
  echo.
  echo The development server stopped with an error.
  pause
)

endlocal
