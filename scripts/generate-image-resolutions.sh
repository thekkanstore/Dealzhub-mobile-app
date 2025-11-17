#!/bin/bash

# Script to generate @1x, @2x, and @3x resolution images for React Native
# Usage: ./generate-image-resolutions.sh <input-image> <output-name> <base-size>
# Example: ./generate-image-resolutions.sh new-logo.png appLogo 155

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <input-image> <output-name> <base-size>"
    echo "Example: $0 new-logo.png appLogo 155"
    echo ""
    echo "This will generate:"
    echo "  - <output-name>.png at <base-size>x<base-size> (@1x)"
    echo "  - <output-name>@2x.png at <base-size*2>x<base-size*2> (@2x)"
    echo "  - <output-name>@3x.png at <base-size*3>x<base-size*3> (@3x)"
    exit 1
fi

INPUT_IMAGE="$1"
OUTPUT_NAME="$2"
BASE_SIZE="$3"

# Calculate sizes
SIZE_1X="${BASE_SIZE}x${BASE_SIZE}"
SIZE_2X="$((BASE_SIZE * 2))x$((BASE_SIZE * 2))"
SIZE_3X="$((BASE_SIZE * 3))x$((BASE_SIZE * 3))"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi

# Check if input image exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "Error: Input image '$INPUT_IMAGE' not found!"
    exit 1
fi

echo "Generating images from: $INPUT_IMAGE"
echo "Output name: $OUTPUT_NAME"
echo "Base size: ${BASE_SIZE}x${BASE_SIZE}"
echo ""

# Generate @1x
convert "$INPUT_IMAGE" -resize "$SIZE_1X" "${OUTPUT_NAME}.png"
echo "✓ Generated ${OUTPUT_NAME}.png (${SIZE_1X})"

# Generate @2x
convert "$INPUT_IMAGE" -resize "$SIZE_2X" "${OUTPUT_NAME}@2x.png"
echo "✓ Generated ${OUTPUT_NAME}@2x.png (${SIZE_2X})"

# Generate @3x
convert "$INPUT_IMAGE" -resize "$SIZE_3X" "${OUTPUT_NAME}@3x.png"
echo "✓ Generated ${OUTPUT_NAME}@3x.png (${SIZE_3X})"

echo ""
echo "All images generated successfully!"
echo ""
echo "File details:"
ls -lh "${OUTPUT_NAME}.png" "${OUTPUT_NAME}@2x.png" "${OUTPUT_NAME}@3x.png" 2>/dev/null

