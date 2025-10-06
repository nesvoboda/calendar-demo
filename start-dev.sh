#!/bin/bash

# Script to start both backend and frontend development servers
# and open the frontend in the browser

set -e

echo "🚀 Starting development servers..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "📡 Starting backend server on port 3000..."
cd backend
pnpm dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "🎨 Starting frontend server on port 5173..."
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 5

# Open frontend in browser
echo "🌐 Opening frontend in browser..."
if command -v open >/dev/null 2>&1; then
    # macOS
    open http://localhost:5173
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open http://localhost:5173
elif command -v start >/dev/null 2>&1; then
    # Windows
    start http://localhost:5173
else
    echo "Please open http://localhost:5173 in your browser"
fi

echo "✅ Development servers are running!"
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo "   Press Ctrl+C to stop all servers"

# Wait for user to stop the servers
wait
