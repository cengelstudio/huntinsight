#!/bin/bash

echo "Building the application..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Running build..."
npm run build

echo "Build completed successfully!"
