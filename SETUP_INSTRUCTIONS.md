# Setup Instructions for New Features

## ✅ Installed Dependencies

All required dependencies have been installed:
- `@react-native-community/geolocation` - Location services
- `react-native-maps` - Map view for Hunt mode
- `react-native-push-notification` - Notifications for nearby Pokémon
- `react-native-vision-camera` - Camera for AR features
- `@react-native-voice/voice` - Voice search
- `react-native-sensors` - Device sensors for VR
- `@react-navigation/bottom-tabs` - Bottom tab navigation

## 📱 Native Configuration Required

### Android Configuration

#### 1. Update `android/app/src/main/AndroidManifest.xml`

Add permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Add Google Maps API key (inside `<application>` tag):
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

#### 2. Update `android/build.gradle`

Ensure Google Services is configured (already done).

#### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for Android"
3. Create API key
4. Add to AndroidManifest.xml

### iOS Configuration

#### 1. Update `ios/MyReactNativeApp/Info.plist`

Add permissions:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Pokédex needs your location to find nearby Pokémon.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Pokédex needs your location to find nearby Pokémon even when the app is in the background.</string>
<key>NSCameraUsageDescription</key>
<string>Pokédex needs camera access for AR features.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Pokédex needs microphone access for voice search.</string>
```

Add Google Maps API key:
```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY</string>
```

#### 2. Install Pods

```bash
cd ios
pod install
cd ..
```

#### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for iOS"
3. Create API key
4. Add to Info.plist

## 🚀 Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## 🎯 Features Implemented

### 1. Geolocation-Based Discovery ✅
- Location services with permission handling
- Hunt mode screen with map view
- Pokémon spawning based on location and biome
- Distance calculation
- Catch functionality

### 2. AR Camera ✅
- Camera integration with permissions
- AR overlay for Pokémon sprites
- Photo capture with AR overlays
- Random Pokémon spawning in AR view

### 3. Voice Search ✅
- Voice recognition integration
- Microphone permissions
- Speech-to-text conversion
- Voice search in Pokedex screen

### 4. Bottom Tab Navigation ✅
- Three tabs: Pokédex, Hunt, AR Camera
- Stack navigation within each tab
- Smooth navigation between features

### 5. Notifications ✅
- Notification service setup
- Nearby Pokémon alerts
- Permission handling

## 📝 Notes

1. **Google Maps API Key**: Required for map functionality. Get it from Google Cloud Console.

2. **Permissions**: All permissions are requested at runtime, but you need to declare them in native config files.

3. **Testing**: 
   - Test location features on a real device (simulators may have limited location support)
   - Test camera features on a real device
   - Test voice search in a quiet environment

4. **GIF/Animated Sprites**: You mentioned you'll handle this. The infrastructure is ready - just update the image loading to support GIFs when you have the URLs.

## 🔧 Troubleshooting

### Maps not showing
- Check Google Maps API key is set correctly
- Ensure Maps SDK is enabled in Google Cloud Console
- Check internet connection

### Location not working
- Grant location permissions
- Test on real device
- Check location services are enabled on device

### Camera not working
- Grant camera permissions
- Test on real device
- Check camera is not in use by another app

### Voice search not working
- Grant microphone permissions
- Test in quiet environment
- Check device has microphone

## 📚 Next Steps

1. Add Google Maps API keys to native config files
2. Test all features on real devices
3. Add GIF support when you have animated sprite URLs
4. Fine-tune spawn rates and distances
5. Add more biome detection logic
6. Enhance AR overlay animations

