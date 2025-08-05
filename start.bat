@echo off
title Sticky Notepad

echo.
echo ================================================
echo            STARTING STICKY NOTEPAD
echo ================================================
echo.
echo Features:
echo   - Always on top of other windows
echo   - Adjustable transparency (10-100%)
echo   - Auto-save your notes
echo   - Keyboard shortcut: Ctrl+Shift+N
echo.
echo Click the gear icon for settings!
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo Please run install.bat first
    echo.
    pause
    exit /b 1
)

REM Start the application
npm start

echo.
echo Application process has ended. Check for errors above.
echo.
pause

REM If we get here, the app was closed
echo.
echo Sticky Notepad closed.
echo.
pause

