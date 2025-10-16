#!/bin/bash

# Blaze Sports Intel - Build Verification Script

echo "🔥 Blaze Sports Intel - Build Verification"
echo "=========================================="
echo ""

# Check if required files exist
echo "✓ Checking required files..."
required_files=(
    "index.html"
    "manifest.json"
    "assets/icon.svg"
    "service-worker.js"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

# Check dist directory
if [ -d "dist" ]; then
    echo "✓ Build directory exists"
    echo "  Size: $(du -sh dist | cut -f1)"
    echo "  Files: $(find dist -type f | wc -l)"
else
    echo "✗ Build directory not found"
fi

echo ""

# Check for common issues
echo "✓ Checking for common issues..."

# Check if node_modules is excluded
if [ -d "dist/node_modules" ]; then
    echo "  ⚠  node_modules found in dist/ - this will increase deployment size"
else
    echo "  ✓ node_modules correctly excluded"
fi

# Check if .env files are excluded
if ls dist/.env* 1> /dev/null 2>&1; then
    echo "  ✗ Environment files found in dist/ - security risk!"
else
    echo "  ✓ Environment files correctly excluded"
fi

echo ""

# Summary
if [ $missing_files -eq 0 ]; then
    echo "✅ Build verification passed!"
    exit 0
else
    echo "❌ Build verification failed - $missing_files files missing"
    exit 1
fi
