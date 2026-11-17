@echo off
title PCMS - Public Complaint Management System Launcher
echo ========================================================
echo   PCMS (Public Complaint Management System)
echo   Auto-Launcher for Windows
echo ========================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during install.
    pause
    exit /b 1
)

REM 2. Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Python Virtual Environment...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

REM If database doesn't exist, seed it
if not exist "pcms.db" (
    echo Initializing and seeding database...
    python seed.py
    python seed_rich_demo_data.py
)

echo [2/4] Starting Flask Backend Server (Port 5001)...
start "PCMS Backend API" cmd /k "call venv\Scripts\activate && python run.py"

cd ..\frontend

echo [3/4] Checking Frontend Node Modules...
if not exist "node_modules" (
    echo Installing frontend npm packages (takes 1-2 minutes)...
    call npm install
)

echo [4/4] Starting Vite Frontend Server (Port 3000)...
start "PCMS Frontend UI" cmd /k "call npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo ========================================================
echo   SUCCESS! PCMS is running!
echo   Opening http://localhost:3000 in your browser...
echo ========================================================
timeout /t 3 >nul
start http://localhost:3000
echo Both backend and frontend are running in separate windows.
echo Do not close those terminal windows while using the portal.
pause
