# Quick Setup Guide - Firebase & Google Sign-In

Based on your Firebase Console information, here's what you need to do:

## Your Current Setup ✅

- **Android App:** `1:282171919212:android:142856ddd62648a9174149`
- **Web App:** `1:282171919212:web:932b2eae56b30dca174149`
- **Package Name:** `com.pokeapp_codehaus`

---

## Step 1: Get Your SHA-1 Certificate Fingerprint (Android)

This is required for Google Sign-In on Android.

### On Windows (PowerShell):

```powershell
cd android
.\gradlew signingReport
```

### On Mac/Linux:

```bash
cd android
./gradlew signingReport
```

**What to look for:**
- Find the section that says `Variant: debug`
- Look for `SHA1:` under `Signing config: debug`
- Copy the SHA-1 value (it looks like: `A1:B2:C3:D4:E5:F6:...`)

**Example output:**
```
Variant: debug
Config: debug
Store: C:\Users\...\debug.keystore
Alias: AndroidDebugKey
SHA1: A1:B2:C3:D4:E5:F6:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

---

## Step 2: Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kodex-2962d**
3. Click **⚙️ Project Settings** → **General** tab
4. Scroll to **"Your apps"** section
5. Find your **Android app** (My Pokedex)
6. Click on it to expand
7. Scroll to **"SHA certificate fingerprints"** section
8. Click **"Add fingerprint"**
9. Paste your SHA-1 value
10. Click **Save**

---

## Step 3: Get Your Web Client ID (OAuth Client ID)

The Web Client ID is **NOT** in the Firebase config you see. It's in the OAuth credentials.

### Method 1: From Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in project: **kodex-2962d**
3. In the left sidebar, click **APIs & Services** → **Credentials**
4. Look for **"OAuth 2.0 Client IDs"** section
5. You should see entries like:
   - **Android client** (for your Android app)
   - **Web client** (for your Web app) ← **This is what you need!**
6. Click on the **Web client** entry
7. Copy the **Client ID** (it ends with `.apps.googleusercontent.com`)

**If you don't see a Web client:**
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Select **"Web application"** as the application type
3. Name it: "React Native Web Client"
4. Click **"Create"**
5. Copy the **Client ID** that appears

### Method 2: From Firebase Console (Alternative)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kodex-2962d**
3. Click **⚙️ Project Settings** → **General** tab
4. Scroll to **"Your apps"** section
5. Click on your **Web app** (CodeHaus)
6. Look for **"OAuth client IDs"** section (it might be collapsed)
7. Find the **"Web client"** entry
8. Copy the **Client ID**

---

## Step 4: Update Your Code

1. Open `src/firebase/googleSignIn.ts`
2. Find this line:
   ```typescript
   const WEB_CLIENT_ID = 'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
   ```
3. Replace it with your actual Web Client ID:
   ```typescript
   const WEB_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
   ```
4. Save the file

---

## Step 5: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kodex-2962d**
3. Click **Authentication** in the left sidebar
4. Click **Sign-in method** tab
5. Find **Google** in the list
6. Click on it
7. Toggle **Enable** to ON
8. Enter a **Support email** (your email)
9. Click **Save**

---

## Step 6: Set Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kodex-2962d**
3. Click **Firestore Database** in the left sidebar
4. Click **Rules** tab
5. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click **Publish**

---

## Step 7: Test It!

1. Restart your React Native app
2. The console warning about missing WEB_CLIENT_ID should disappear
3. Try signing in with Google
4. Check that user profile is created in Firestore

---

## Troubleshooting

**"I can't find OAuth Client IDs"**
- Go to Google Cloud Console → APIs & Services → Credentials
- Make sure you're in the correct project (kodex-2962d)

**"SHA-1 command doesn't work"**
- Make sure you're in the `android` folder
- On Windows, use `.\gradlew` (with backslash)
- On Mac/Linux, use `./gradlew` (with forward slash)

**"Google Sign-In still doesn't work"**
- Verify SHA-1 is added in Firebase Console
- Check Web Client ID is correct (ends with `.apps.googleusercontent.com`)
- Make sure Google Sign-In is enabled in Firebase Console → Authentication
- Restart your app after making changes

---

## Summary Checklist

- [ ] Get SHA-1 fingerprint using `gradlew signingReport`
- [ ] Add SHA-1 to Firebase Console → Android app
- [ ] Get Web Client ID from Google Cloud Console → Credentials
- [ ] Update `src/firebase/googleSignIn.ts` with Web Client ID
- [ ] Enable Google Sign-In in Firebase Console → Authentication
- [ ] Set Firestore security rules
- [ ] Test Google Sign-In

