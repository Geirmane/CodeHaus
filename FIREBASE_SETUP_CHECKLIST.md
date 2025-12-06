    # Firebase Database & Google Authentication Setup Checklist

## ✅ What's Already Configured

1. **Dependencies Installed:**
   - `@react-native-firebase/app` ✅
   - `@react-native-firebase/auth` ✅
   - `@react-native-firebase/firestore` ✅
   - `@react-native-google-signin/google-signin` ✅

2. **Android Configuration:**
   - `google-services.json` file present ✅
   - Google Services plugin applied in `build.gradle` ✅
   - Firebase dependencies added ✅

3. **iOS Configuration:**
   - `GoogleService-Info.plist` file present ✅
   - Firebase initialized in `AppDelegate.swift` ✅

4. **Code Implementation:**
   - Auth service with Google Sign-In logic ✅
   - AuthContext with Firebase integration ✅
   - User profile creation in Firestore ✅

---

## ❌ What's Missing

### 1. **Google Sign-In Web Client ID** (CRITICAL)

**Location:** `src/firebase/googleSignIn.ts`

**Current Status:** Placeholder value `'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'`

**Important:** You don't need to use the web SDK initialization code (`initializeApp`) in React Native. React Native Firebase automatically uses your native config files. However, you DO need the **Web Client ID** from OAuth credentials.

**How to Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `kodex-2962d`
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll to **Your apps** section
5. Find your **Web app** (you should have created this - app ID: `1:282171919212:web:932b2eae56b30dca174149`)
6. Click on the Web app to expand it
7. Look for **"OAuth client IDs"** section
8. Copy the **Web client** ID (it looks like: `123456789-abc...xyz.apps.googleusercontent.com`)
9. Update `src/firebase/googleSignIn.ts` with the actual Web Client ID

**Alternative:** See `HOW_TO_GET_WEB_CLIENT_ID.md` for detailed step-by-step instructions with screenshots guidance.

---

### 2. **iOS URL Scheme for Google Sign-In** (REQUIRED for iOS)

**Location:** `ios/MyReactNativeApp/Info.plist`

**Current Status:** Missing `CFBundleURLSchemes` configuration

**How to Fix:**
1. Get the **REVERSED_CLIENT_ID** from `ios/MyReactNativeApp/GoogleService-Info.plist`
   - If it's not in the file, you need to:
     - Go to Firebase Console → Project Settings → General
     - Find your iOS app
     - Download the latest `GoogleService-Info.plist`
     - Look for `REVERSED_CLIENT_ID` key
2. Add URL scheme to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

**Example:** If `REVERSED_CLIENT_ID` is `com.googleusercontent.apps.123456789-abcxyz`, add it to the URL schemes array.

---

### 3. **iOS AppDelegate URL Handling** (REQUIRED for iOS)

**Location:** `ios/MyReactNativeApp/AppDelegate.swift`

**Current Status:** Missing URL handling method for Google Sign-In callback

**How to Fix:**
Add this method to the `AppDelegate` class:

```swift
func application(
  _ app: UIApplication,
  open url: URL,
  options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
  return GoogleSignin.handle(url)
}
```

**Note:** You'll also need to import Google Sign-In:
```swift
import GoogleSignIn
```

---

### 4. **Firebase Console Configuration** (REQUIRED)

#### A. Enable Google Sign-In Provider

1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Enable it
4. Add your **support email**
5. Save

#### B. Configure OAuth Clients

**For Android:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `kodex-2962d`
3. Go to **APIs & Services** → **Credentials**
4. Find or create OAuth 2.0 Client ID for Android
5. Package name: `com.pokeapp_codehaus`
6. SHA-1 certificate fingerprint (get from: `cd android && ./gradlew signingReport`)

**For iOS:**
1. In Google Cloud Console → **Credentials**
2. Find or create OAuth 2.0 Client ID for iOS
3. Bundle ID: `org.reactjs.native.example.MyReactNativeApp`
4. App Store ID (optional)

**For Web (used by React Native):**
1. In Google Cloud Console → **Credentials**
2. Create OAuth 2.0 Client ID for Web application
3. This is the **Web Client ID** you'll use in `googleSignIn.ts`

---

### 5. **Firestore Security Rules** (REQUIRED for Database)

**Location:** Firebase Console → Firestore Database → Rules

**Current Status:** Unknown (needs verification)

**Recommended Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collections as needed
  }
}
```

**How to Set:**
1. Go to Firebase Console → **Firestore Database** → **Rules** tab
2. Paste the rules above
3. Click **Publish**

---

### 6. **Android SHA-1 Certificate** (REQUIRED for Android Google Sign-In)

**How to Get:**
1. Open terminal in project root
2. Run: `cd android && ./gradlew signingReport`
3. Copy the SHA-1 fingerprint from the debug keystore
4. Go to Firebase Console → Project Settings → Your apps → Android app
5. Click "Add fingerprint"
6. Paste the SHA-1 and save

**For Release Builds:**
- You'll need the SHA-1 from your release keystore
- Add it the same way in Firebase Console

---

## 📋 Quick Setup Steps Summary

1. ✅ **Get Web Client ID** from Firebase Console → Project Settings → Web app
2. ✅ **Update** `src/firebase/googleSignIn.ts` with Web Client ID
3. ✅ **Enable Google Sign-In** in Firebase Console → Authentication
4. ✅ **Add iOS URL Scheme** to `Info.plist` (REVERSED_CLIENT_ID)
5. ✅ **Add URL handling** to `AppDelegate.swift`
6. ✅ **Configure OAuth clients** in Google Cloud Console
7. ✅ **Add SHA-1 fingerprint** for Android in Firebase Console
8. ✅ **Set Firestore security rules** in Firebase Console

---

## 🧪 Testing Checklist

After completing the above:

- [ ] Google Sign-In button appears and is enabled
- [ ] Google Sign-In works on Android
- [ ] Google Sign-In works on iOS
- [ ] User profile is created in Firestore after sign-in
- [ ] User can sign out successfully
- [ ] Email/password authentication still works

---

## 🔍 Troubleshooting

**"Google Sign-In was cancelled or missing credentials"**
- Check Web Client ID is correct
- Verify Google Sign-In is enabled in Firebase Console
- Check SHA-1 fingerprint is added for Android

**"Network request failed" (iOS)**
- Verify URL scheme is added to Info.plist
- Check REVERSED_CLIENT_ID is correct
- Ensure AppDelegate handles URLs

**"Permission denied" (Firestore)**
- Check Firestore security rules
- Verify user is authenticated
- Check collection/document paths match rules

---

## 📚 Additional Resources

- [React Native Firebase Auth Docs](https://rnfirebase.io/auth/usage)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

