# How to Get Your Web Client ID for Google Sign-In

## Important Note
**You don't need to use the web SDK initialization code** (`initializeApp`) in React Native. React Native Firebase automatically initializes using your native configuration files (`google-services.json` and `GoogleService-Info.plist`).

However, you **DO need** the **Web Client ID** from the OAuth credentials for Google Sign-In to work.

---

## Method 1: From Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **kodex-2962d**
3. Click the **gear icon** (⚙️) next to "Project Overview" → **Project Settings**
4. Go to the **General** tab
5. Scroll down to the **"Your apps"** section
6. Find your **Web app** (the one you just created with app ID: `1:282171919212:web:932b2eae56b30dca174149`)
7. Click on it to expand
8. Look for the **"OAuth client IDs"** section
9. Find the one labeled **"Web client"** or **"Web application"**
10. Copy the **Client ID** (it will look like: `123456789-abc...xyz.apps.googleusercontent.com`)

---

## Method 2: From Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: **kodex-2962d**
3. In the left sidebar, go to **APIs & Services** → **Credentials**
4. Look for **"OAuth 2.0 Client IDs"** section
5. Find the entry with **Type: "Web client"** or **"Web application"**
6. Click on it to view details
7. Copy the **Client ID** value

---

## Method 3: Check if OAuth Client Was Created

When you created the Web app in Firebase, an OAuth client should have been created automatically. If you don't see it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **kodex-2962d**
3. Go to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. Select **"Web application"** as the application type
6. Give it a name (e.g., "React Native Web Client")
7. Click **"Create"**
8. Copy the **Client ID** that appears

---

## After Getting the Web Client ID

1. Open `src/firebase/googleSignIn.ts`
2. Replace `'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'` with your actual Web Client ID
3. Save the file

**Example:**
```typescript
const WEB_CLIENT_ID = '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
```

---

## Verify It's Working

After updating the Web Client ID:

1. Restart your React Native app
2. The console warning about missing WEB_CLIENT_ID should disappear
3. The Google Sign-In button should be enabled
4. Try signing in with Google to test

---

## Troubleshooting

**"I can't find the OAuth client IDs in Firebase Console"**
- Make sure you're looking at the Web app, not Android or iOS
- Try Method 2 (Google Cloud Console) instead
- The OAuth client might need to be created manually (Method 3)

**"The Client ID doesn't end with .apps.googleusercontent.com"**
- Make sure you're copying the Client ID, not the Client Secret
- The Client ID should always end with `.apps.googleusercontent.com`

**"Google Sign-In still doesn't work"**
- Make sure Google Sign-In is enabled in Firebase Console → Authentication → Sign-in method
- Check that you've added the SHA-1 fingerprint for Android (see FIREBASE_SETUP_CHECKLIST.md)
- Verify the iOS URL scheme is configured (see FIREBASE_SETUP_CHECKLIST.md)

