#!/bin/bash

# Function to find Chrome executable
find_chrome() {
    # Check common Chrome locations
    if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
        echo "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif command -v google-chrome-stable >/dev/null 2>&1; then
        echo "google-chrome-stable"
    elif command -v google-chrome >/dev/null 2>&1; then
        echo "google-chrome"
    elif command -v chromium >/dev/null 2>&1; then
        echo "chromium"
    else
        echo "Chrome not found. Please install Google Chrome or Chromium."
        exit 1
    fi
}

# Get Chrome executable path
CHROME=$(find_chrome)

# Create screenshot directories
mkdir -p screenshots/advanced-example
mkdir -p screenshots/magical-kingdom
mkdir -p screenshots/house-coloring

# Function to capture screenshot
capture_screenshot() {
    local url=$1
    local output=$2
    local delay=$3
    
    # Wait for the page to load and animations to start
    sleep $delay
    
    # Capture screenshot using Chrome in headless mode with additional flags for WebGL support
    "$CHROME" --headless \
        --disable-gpu \
        --use-gl=swiftshader \
        --enable-webgl \
        --enable-webgl2 \
        --enable-unsafe-swiftshader \
        --disable-software-rasterizer \
        --no-sandbox \
        --disable-setuid-sandbox \
        --screenshot="$output" \
        --window-size=1920,1080 \
        "$url"
    
    # Check if screenshot was captured successfully
    if [ ! -f "$output" ]; then
        echo "Failed to capture screenshot: $output"
        echo "Trying alternative method..."
        
        # Try alternative method with different flags
        "$CHROME" --headless \
            --disable-gpu \
            --use-gl=desktop \
            --enable-webgl \
            --enable-webgl2 \
            --no-sandbox \
            --disable-setuid-sandbox \
            --screenshot="$output" \
            --window-size=1920,1080 \
            "$url"
            
        if [ ! -f "$output" ]; then
            echo "Failed to capture screenshot with alternative method: $output"
            exit 1
        fi
    fi
}

# Check if http-server is installed
if ! command -v http-server >/dev/null 2>&1; then
    echo "http-server not found. Installing..."
    npm install -g http-server
fi

# Start local server in background
echo "Starting local server..."
http-server &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Capture Advanced Example screenshots
echo "Capturing Advanced Example screenshots..."
capture_screenshot "http://localhost:8000/advanced-example/" "screenshots/advanced-example/main.png" 60

# Capture Magical Kingdom screenshots
echo "Capturing Magical Kingdom screenshots..."
capture_screenshot "http://localhost:8000/magical-kingdom/" "screenshots/magical-kingdom/main.png" 60

# Capture House Coloring screenshots
echo "Capturing House Coloring screenshots..."
capture_screenshot "http://localhost:8000/house-coloring/" "screenshots/house-coloring/main.png" 60

# Stop local server
echo "Stopping local server..."
kill $SERVER_PID

echo "Screenshots captured successfully!" 