#!/bin/bash

echo "Starting development server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
echo "Starting development server on http://localhost:3000"
npm run dev
