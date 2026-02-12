# Image Asset Management Guide for React Native

## Overview
React Native uses different image resolutions to support various device screen densities. This ensures images look crisp on all devices.

## Image Resolution Naming Convention

- **filename.png** - Base resolution (@1x) - Used on standard density screens
- **filename@2x.png** - Double resolution (@2x) - Used on high density screens (most modern phones)
- **filename@3x.png** - Triple resolution (@3x) - Used on very high density screens (iPhone Plus, Pro models)

## Size Ratios

If your base image (@1x) is 100x100 pixels:
- @1x → 100x100
- @2x → 200x200
- @3x → 300x300

## How to Generate Multiple Resolutions

### Option 1: Using the Helper Script (Recommended)

We've created a script at `scripts/generate-image-resolutions.sh` for easy image generation.

**Usage:**
```bash
cd src/assets/images
../../scripts/generate-image-resolutions.sh <input-image> <output-name> <base-size>
```

**Example:**
```bash
# Generate app logo from a 1024x1024 source image
../../scripts/generate-image-resolutions.sh new-logo.png appLogo 155

# This creates:
# - appLogo.png (155x155)
# - appLogo@2x.png (310x310)
# - appLogo@3x.png (465x465)
```

### Option 2: Using ImageMagick Directly

If you have ImageMagick installed:

```bash
# Generate @1x (base)
convert source-image.png -resize 100x100 output.png

# Generate @2x
convert source-image.png -resize 200x200 output@2x.png

# Generate @3x
convert source-image.png -resize 300x300 output@3x.png
```

### Option 3: Using Online Tools

- **App Icon Generator**: https://www.appicon.co/
- **Make App Icon**: https://makeappicon.com/
- **Icon Kitchen**: https://icon.kitchen/

### Option 4: Using Node.js Script

Install sharp: `npm install --save-dev sharp`

```javascript
// scripts/resize-image.js
const sharp = require('sharp');
const path = require('path');

async function generateResolutions(inputPath, outputName, baseSize) {
  const sizes = [
    { suffix: '', size: baseSize },
    { suffix: '@2x', size: baseSize * 2 },
    { suffix: '@3x', size: baseSize * 3 }
  ];

  for (const { suffix, size } of sizes) {
    await sharp(inputPath)
      .resize(size, size)
      .toFile(`${outputName}${suffix}.png`);
    console.log(`✓ Generated ${outputName}${suffix}.png (${size}x${size})`);
  }
}

// Usage: node scripts/resize-image.js
generateResolutions('new-logo.png', 'appLogo', 155);
```

## Common Image Sizes in React Native

### App Icons (Launcher Icons)
Different platforms require different sizes. Use a tool like `react-native-asset` or manually create:

**Android (in android/app/src/main/res/):**
- mipmap-mdpi: 48x48 (@1x)
- mipmap-hdpi: 72x72 (@1.5x)
- mipmap-xhdpi: 96x96 (@2x)
- mipmap-xxhdpi: 144x144 (@3x)
- mipmap-xxxhdpi: 192x192 (@4x)

**iOS (in ios/AppName/Images.xcassets/AppIcon.appiconset/):**
- Various sizes from 20x20 to 1024x1024
- Best to use Xcode or an icon generator tool

### In-App Images

For in-app images (like logos, buttons, icons), start with:
- Source image: As large as possible (e.g., 1024x1024 or larger)
- @1x: The size you want to display at (e.g., 100x100)
- @2x: Double the @1x size (200x200)
- @3x: Triple the @1x size (300x300)

## Best Practices

1. **Start with high-resolution source**: Always work from the highest quality source image possible (vector/SVG or high-res PNG)

2. **Use PNG for transparency**: If your image needs transparency, use PNG format

3. **Optimize file sizes**: Use tools like `pngquant` or `imageoptim` to reduce file sizes without losing quality

4. **Consistent naming**: Always use the @2x and @3x suffix convention

5. **Let React Native choose**: When using images in code, just reference the base name:
   ```javascript
   <Image source={require('./appLogo.png')} />
   ```
   React Native automatically picks the right resolution based on device.

## Current App Logo Sizes

For this project, the app logo uses:
- **appLogo.png**: 155x155 (@1x)
- **appLogo@2x.png**: 310x310 (@2x)
- **appLogo@3x.png**: 465x465 (@3x)

## Updating the App Logo

1. Place your new high-resolution logo (e.g., `new-logo.png`) in `src/assets/images/`
2. Run the generation script:
   ```bash
   cd src/assets/images
   ../../scripts/generate-image-resolutions.sh new-logo.png appLogo 155
   ```
3. The old logo files will be replaced with the new ones
4. No code changes needed - React Native will automatically use the new images

## Troubleshooting

**Images look blurry:**
- Make sure you have all three resolutions (@1x, @2x, @3x)
- Ensure the source image is high quality
- Check that the @2x is exactly 2x the @1x size, and @3x is 3x

**Images not updating:**
- Clear Metro bundler cache: `npm start -- --reset-cache`
- For Android: `cd android && ./gradlew clean && cd ..`
- For iOS: Clean build folder in Xcode

**Wrong size displayed:**
- Check that you're not setting explicit width/height in styles that conflicts with the image's natural size
- Use `resizeMode` prop appropriately: 'contain', 'cover', 'stretch', 'center'

