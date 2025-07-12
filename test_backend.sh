#!/bin/bash

echo "🧪 Testing Backend Locally"
echo "=========================="

# Check if backend directory exists
if [ ! -d "app/backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

echo "✅ Backend directory found"

# Test if we can run the main.py file
echo "🔍 Testing main.py execution..."
cd app/backend
timeout 5s python3 main.py &
BACKEND_PID=$!

# Wait a moment for the server to start
sleep 2

# Check if the process is still running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server started successfully"
    kill $BACKEND_PID
else
    echo "❌ Backend server failed to start"
    exit 1
fi

echo "✅ Backend tests completed successfully!"
echo "🚀 Ready for deployment!" 