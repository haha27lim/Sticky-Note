@echo off
title Sticky Notepad - Installation

echo.
echo ================================================
echo          STICKY NOTEPAD INSTALLATION
echo ================================================
echo.
echo This script will install the Sticky Notepad application.
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/downloads/
    echo Make sure to check "Add to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing dependencies...
echo This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo          INSTALLATION COMPLETE!
echo ================================================
echo.
echo To start the Sticky Notepad:
echo   1. Double-click "start.bat"
echo   2. Or run "npm start" in this folder
echo.
echo Keyboard shortcut: Ctrl+Shift+N (show/hide)
echo.
echo Features:
echo   - Always stays on top
echo   - Adjustable transparency
echo   - Auto-save notes
echo   - Customizable colors
echo.
pause

