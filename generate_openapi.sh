#!/bin/bash

# Start the backend server in the background
echo "Starting backend server..."
cd backend
pnpm dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -f http://localhost:3000/openapi/json > /dev/null 2>&1; then
    echo "Backend failed to start or OpenAPI endpoint not available"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "Backend is ready, generating types..."

# Generate types in frontend
cd ../frontend
npx openapi-typescript http://localhost:3000/openapi/json -o src/types/api.ts

echo "Types generated successfully!"

# Stop the backend server
echo "Stopping backend server..."
kill $BACKEND_PID 2>/dev/null

echo "Done!"
