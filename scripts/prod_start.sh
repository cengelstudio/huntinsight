#!/bin/bash

echo "Starting production server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application first
echo "Building the application..."
npm run build

# Start production server
echo "Starting production server on http://localhost:3000"
npm start
