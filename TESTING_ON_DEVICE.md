# Testing on Real Android Device

## Method 1: USB Connection (Recommended)

### Step 1: Enable Developer Options on Your Phone
1. Go to **Settings** → **About Phone**
2. Find **Build Number** (might be under "Software Information")
3. Tap **Build Number** 7 times until you see "You are now a developer!"
4. Go back to **Settings** → **Developer Options**
5. Enable **USB Debugging**
6. Enable **Install via USB** (if available)

### Step 2: Connect Your Phone
1. Connect your Android phone to your computer via USB cable
2. On your phone, you'll see a popup asking "Allow USB debugging?" → Tap **Allow**
3. Check "Always allow from this computer" if you want to skip this in the future

### Step 3: Verify Connection
Open a terminal/command prompt and run:
```bash
adb devices
```

You should see your device listed, for example:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", check your phone for the USB debugging permission popup.

### Step 4: Run the App
```bash
npm run android
```

The app will build and install on your connected device automatically.

---

## Method 2: Wireless Debugging (Android 11+)

### Option A: Pair Device Using QR Code (Easiest)

#### Step 1: Enable Wireless Debugging
1. Go to **Settings** → **Developer Options**
2. Enable **Wireless Debugging**
3. Tap on **Wireless Debugging** to open settings
4. Tap **Pair device with pairing code**

#### Step 2: Scan QR Code
1. A QR code will appear on your phone screen
2. On your computer, open a terminal and run:
   ```bash
   adb pair
   ```
3. The command will prompt you to enter:
   - **IP address and port** (shown on your phone, e.g., `192.168.1.100:XXXXX`)
   - **Pairing code** (6-digit code shown on your phone)
4. After pairing, you'll see a message like "Successfully paired to..."

#### Step 3: Connect to Device
1. Go back to **Wireless Debugging** on your phone
2. Note the **IP address and port** shown under "IP address & Port" (e.g., `192.168.1.100:XXXXX`)
3. In your terminal, run:
   ```bash
   adb connect <IP_ADDRESS>:<PORT>
   ```
   For example:
   ```bash
   adb connect 192.168.1.100:37023
   ```

#### Step 4: Verify Connection
```bash
adb devices
```
You should see your device listed as "device" (not "offline")

#### Step 5: Run the App
```bash
npm run android
```

---

### Option B: Pair Device Manually (Without QR Code)

#### Step 1: Enable Wireless Debugging
1. Go to **Settings** → **Developer Options**
2. Enable **Wireless Debugging**
3. Tap on **Wireless Debugging** to open settings
4. Tap **Pair device with pairing code**

#### Step 2: Note Pairing Information
1. Note the **IP address and port** shown (e.g., `192.168.1.100:XXXXX`)
2. Note the **6-digit pairing code** shown on screen

#### Step 3: Pair from Computer
In your terminal, run:
```bash
adb pair <IP_ADDRESS>:<PORT>
```

For example:
```bash
adb pair 192.168.1.100:37023
```

When prompted, enter the **6-digit pairing code** from your phone.

#### Step 4: Connect to Device
After successful pairing, connect:
```bash
adb connect <IP_ADDRESS>:<PORT>
```

#### Step 5: Verify and Run
```bash
adb devices
npm run android
```

---

## Method 3: Development Build (APK)

### Step 1: Build Debug APK
```bash
cd android
./gradlew assembleDebug
```

The APK will be created at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 2: Transfer to Phone
1. Copy `app-debug.apk` to your phone (via USB, email, cloud storage, etc.)
2. On your phone, go to **Settings** → **Security** → Enable **Install from Unknown Sources**
3. Open the APK file on your phone and install it

### Step 3: Start Metro Bundler
In your project directory:
```bash
npm start
```

### Step 4: Connect to Development Server
When you open the app, shake your device (or press `Ctrl+M` / `Cmd+M` on emulator) to open the developer menu, then:
- Tap **Settings**
- Enter your computer's IP address in "Debug server host & port for device"
- Format: `YOUR_IP:8081` (e.g., `192.168.1.50:8081`)

To find your computer's IP:
- **Windows**: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
- **Mac/Linux**: Open Terminal, type `ifconfig` or `ip addr`, look for your network interface IP

---

## Troubleshooting

### Device Not Detected
1. Make sure USB debugging is enabled
2. Try a different USB cable (some cables are charge-only)
3. Try a different USB port
4. Restart ADB: `adb kill-server && adb start-server`
5. On Windows, install/update USB drivers for your device

### App Crashes on Launch
1. Check Metro bundler is running: `npm start`
2. Check device logs: `adb logcat | grep ReactNativeJS`
3. Make sure all permissions are granted (Camera, Microphone, Location, etc.)

### Build Errors
1. Clean build: `cd android && ./gradlew clean && cd ..`
2. Clear Metro cache: `npm start -- --reset-cache`
3. Reinstall node_modules: `rm -rf node_modules && npm install`

### Connection Issues
1. Make sure phone and computer are on the same Wi-Fi network (for wireless)
2. Check firewall isn't blocking port 8081
3. Try disabling VPN if active

---

## Quick Test Checklist

- [ ] USB Debugging enabled
- [ ] Device connected and authorized (`adb devices` shows device)
- [ ] Metro bundler running (`npm start`)
- [ ] App installed and running on device
- [ ] Camera permission granted (for AR screen)
- [ ] Microphone permission granted (for voice search)
- [ ] Location permission granted (for Hunt screen)

---

## Useful Commands

```bash
# Check connected devices
adb devices

# View device logs
adb logcat

# Install APK directly
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Uninstall app
adb uninstall com.pokeapp_codehaus

# Restart ADB
adb kill-server
adb start-server

# Clear app data
adb shell pm clear com.pokeapp_codehaus
```

---

## Notes

- **First build takes longer** (5-10 minutes) - be patient!
- **Subsequent builds are faster** (1-2 minutes)
- **Keep Metro bundler running** while testing
- **Hot reload works** - save files and see changes instantly
- **Shake device** to open developer menu for debugging options

