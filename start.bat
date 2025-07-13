@echo off
REM Smart launcher for Off-Grid Discounts dev server
REM This script will find an available port starting from 3100

echo.
echo 🚀 Starting Off-Grid Discounts Development Server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Run the smart launcher
node start-dev.js

pause