# Your Firebase Configuration Values

## ✅ SHA-1 Certificate Fingerprint (Android)

**Copy this value and add it to Firebase Console:**

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### How to Add It:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kodex-2962d**
3. Click **⚙️ Project Settings** → **General** tab
4. Scroll to **"Your apps"** section
5. Find your **Android app** (My Pokedex - App ID: `1:282171919212:android:142856ddd62648a9174149`)
6. Click on it to expand
7. Scroll to **"SHA certificate fingerprints"** section
8. Click **"Add fingerprint"**
9. Paste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
10. Click **Save**

---

## 🔑 Web Client ID (OAuth Client ID) - NEED TO GET

**This is NOT in the Firebase config you see. You need to get it from Google Cloud Console.**

### Step-by-Step:

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

### After Getting It:

1. Open `src/firebase/googleSignIn.ts`
2. Find this line:
   ```typescript
   const WEB_CLIENT_ID = 'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
   ```
3. Replace with your actual Web Client ID:
   ```typescript
   const WEB_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```

---

## 📋 Your App Information

- **Project ID:** `kodex-2962d`
- **Android App ID:** `1:282171919212:android:142856ddd62648a9174149`
- **Web App ID:** `1:282171919212:web:932b2eae56b30dca174149`
- **Package Name:** `com.pokeapp_codehaus`
- **SHA-1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

---

## ✅ Next Steps Checklist

- [ ] Add SHA-1 fingerprint to Firebase Console (Android app)
- [ ] Get Web Client ID from Google Cloud Console
- [ ] Update `src/firebase/googleSignIn.ts` with Web Client ID
- [ ] Enable Google Sign-In in Firebase Console → Authentication → Sign-in method
- [ ] Set Firestore security rules (see FIREBASE_SETUP_CHECKLIST.md)
- [ ] Test Google Sign-In

---

## 🚨 Important Notes

1. **You DON'T need the web SDK initialization code** (`initializeApp`) - React Native Firebase handles this automatically
2. **The Web Client ID is different from the Firebase config** - it's in OAuth credentials, not the Firebase config
3. **Both SHA-1 and Web Client ID are required** for Google Sign-In to work

---

## 📚 See Also

- `QUICK_SETUP_GUIDE.md` - Detailed step-by-step instructions
- `FIREBASE_SETUP_CHECKLIST.md` - Complete checklist
- `HOW_TO_GET_WEB_CLIENT_ID.md` - More details on finding Web Client ID

