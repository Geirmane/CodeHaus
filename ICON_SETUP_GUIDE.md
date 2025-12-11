# App Icon Setup Guide

## ✅ App Name Updated
The app name has been changed to **"CodeHaus PokeDex"** in:
- `android/app/src/main/res/values/strings.xml`
- `app.json`

## 📱 Setting Up the App Icon

### Step 1: Prepare Your Pokemon Image
A source image has been created: `assets/icon-source.png` (copied from Gardevoir.png)

**Recommended:**
- Use a square image (1024x1024px is ideal)
- Use a Pokemon image (Pikachu, Pokeball, or any Pokemon)
- Make sure the image is clear and recognizable at small sizes

### Step 2: Generate Android Icons

#### Option A: Online Tool (Easiest - Recommended)
1. Go to one of these free online tools:
   - **MakeAppIcon**: https://makeappicon.com/
   - **AppIcon.co**: https://www.appicon.co/
   - **Icon Kitchen**: https://icon.kitchen/

2. Upload your `assets/icon-source.png` (or any Pokemon image)

3. Download the generated Android icon set

4. Extract the zip file and copy the `mipmap-*` folders to:
   ```
   android/app/src/main/res/
   ```
   Replace the existing `mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, and `mipmap-xxxhdpi` folders.

#### Option B: Manual (Using Image Editor)
Create icons in these sizes and save them:

| Folder | Size | Files Needed |
|--------|------|--------------|
| `mipmap-mdpi` | 48x48px | `ic_launcher.png`, `ic_launcher_round.png` |
| `mipmap-hdpi` | 72x72px | `ic_launcher.png`, `ic_launcher_round.png` |
| `mipmap-xhdpi` | 96x96px | `ic_launcher.png`, `ic_launcher_round.png` |
| `mipmap-xxhdpi` | 144x144px | `ic_launcher.png`, `ic_launcher_round.png` |
| `mipmap-xxxhdpi` | 192x192px | `ic_launcher.png`, `ic_launcher_round.png` |

**Note:** `ic_launcher_round.png` is the same as `ic_launcher.png` but Android will use it for devices with round icon support.

#### Option C: Using ImageMagick (If Installed)
If you have ImageMagick installed, you can run:
```bash
node scripts/generate-app-icon.js
```

Or manually:
```bash
# For each size, run:
magick assets/icon-source.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick assets/icon-source.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
# Repeat for other sizes: 72, 96, 144, 192
```

### Step 3: Rebuild the App
After updating the icons, rebuild your Android app:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

Or if you're building an APK:
```bash
cd android
./gradlew assembleRelease
```

## 🎨 Icon Tips
- **Use a recognizable Pokemon**: Pikachu, Pokeball, or your favorite Pokemon
- **Keep it simple**: Icons should be clear even at 48x48px
- **Use transparent background**: If possible, use PNG with transparency
- **Test on device**: Always test the icon on an actual device to see how it looks

## 📝 Current Status
- ✅ App name changed to "CodeHaus PokeDex"
- ✅ Source icon image created: `assets/icon-source.png`
- ⏳ Waiting for icon generation (use one of the methods above)

