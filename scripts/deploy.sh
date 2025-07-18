#!/bin/bash

# Railway Frontend Deployment Script
echo "🚀 Preparing Next.js frontend for Railway deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Clean up any existing build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf .next
rm -rf out
rm -rf node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Build successful! Application is ready for deployment."
    echo "📁 Build output: .next/"
    echo "🚀 Ready to deploy to Railway!"
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi 