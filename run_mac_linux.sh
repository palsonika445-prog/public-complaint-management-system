#!/usr/bin/env bash
echo "========================================================"
echo "  PCMS (Public Complaint Management System)"
echo "  Auto-Launcher for macOS / Linux"
echo "========================================================"
echo ""

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

# 2. Check Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "[1/4] Checking Python Virtual Environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

if [ ! -f "pcms.db" ]; then
    echo "Initializing and seeding database..."
    python seed.py
    python seed_rich_demo_data.py
fi

echo "[2/4] Starting Flask Backend Server (Port 5001)..."
python run.py &
BACKEND_PID=$!
echo "Backend running with PID $BACKEND_PID"

cd ../frontend

echo "[3/4] Checking Frontend Node Modules..."
if [ ! -d "node_modules" ]; then
    echo "Installing frontend npm packages..."
    npm install
fi

echo "[4/4] Starting Vite Frontend Server (Port 3000)..."
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!
echo "Frontend running with PID $FRONTEND_PID"

echo ""
echo "========================================================"
echo "  SUCCESS! PCMS is running!"
echo "  Web Portal: http://localhost:3000"
echo "  Mobile App: http://localhost:3000/app"
echo "========================================================"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
