/**
 * Script to generate Android app icons from a source Pokemon image
 * 
 * Usage:
 *   1. Place your Pokemon image (1024x1024px recommended) in assets/icon-source.png
 *   2. Run: node scripts/generate-app-icon.js
 * 
 * This will generate all required icon sizes for Android in the mipmap folders
 */

const fs = require('fs');
const path = require('path');

// Android icon sizes (in pixels)
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const roundIconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const sourceImagePath = path.join(__dirname, '../assets/icon-source.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

console.log('📱 Android App Icon Generator');
console.log('==============================\n');

// Check if source image exists
if (!fs.existsSync(sourceImagePath)) {
  console.error('❌ Error: Source image not found!');
  console.error(`   Expected location: ${sourceImagePath}`);
  console.error('\n📝 Instructions:');
  console.error('   1. Find or create a Pokemon image (1024x1024px recommended)');
  console.error('   2. Save it as: assets/icon-source.png');
  console.error('   3. Run this script again\n');
  console.error('💡 Tip: You can use:');
  console.error('   - Pikachu, Pokeball, or any Pokemon image');
  console.error('   - Online tools like: https://www.favicon-generator.org/');
  console.error('   - Or use the Gardevoir.png in assets/ and rename it to icon-source.png');
  process.exit(1);
}

console.log('✅ Source image found!');
console.log(`   Location: ${sourceImagePath}\n`);

console.log('⚠️  Note: This script requires an image processing tool.');
console.log('   For best results, use one of these methods:\n');
console.log('📋 Method 1: Online Tool (Easiest)');
console.log('   1. Go to: https://www.appicon.co/ or https://icon.kitchen/');
console.log('   2. Upload your Pokemon image');
console.log('   3. Download the Android icon set');
console.log('   4. Extract and copy the mipmap-* folders to:');
console.log(`      ${androidResPath}\n`);
console.log('📋 Method 2: Manual (Using Image Editor)');
console.log('   Create icons in these sizes and save to respective folders:\n');
Object.entries(iconSizes).forEach(([folder, size]) => {
  console.log(`   ${folder}: ${size}x${size}px → ${path.join(androidResPath, folder, 'ic_launcher.png')}`);
  console.log(`   ${folder}: ${size}x${size}px → ${path.join(androidResPath, folder, 'ic_launcher_round.png')}`);
});
console.log('\n📋 Method 3: Using ImageMagick (if installed)');
console.log('   Run these commands in the project root:\n');
Object.entries(iconSizes).forEach(([folder, size]) => {
  const folderPath = path.join(androidResPath, folder);
  console.log(`   mkdir -p "${folderPath}"`);
  console.log(`   magick "${sourceImagePath}" -resize ${size}x${size} "${path.join(folderPath, 'ic_launcher.png')}"`);
  console.log(`   magick "${sourceImagePath}" -resize ${size}x${size} "${path.join(folderPath, 'ic_launcher_round.png')}"`);
});
console.log('\n✅ App name updated to: CodeHaus PokeDex');
console.log('   After generating icons, rebuild your app to see the changes!\n');

