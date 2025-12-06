# Firebase Setup Guide for Pokemon App

## Overview
This app now includes Pokemon-themed authentication with Firebase. Follow these steps to complete the setup.

## Prerequisites
- A Google/Firebase account
- Android Studio (for Android development)

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "Pokemon App")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Add Android App to Firebase
1. In Firebase Console, click the Android icon
2. Enter your package name: `com.pokeapp_codehaus` (or your actual package name from `android/app/build.gradle`)
3. Download `google-services.json`
4. Place it in `android/app/` directory

### 3. Enable Authentication Methods
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password"
3. (Optional) Enable "Google" for Google Sign-In

### 4. Configure Android Build Files

The following changes need to be made:

#### `android/build.gradle`
Add Google services classpath:
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

#### `android/app/build.gradle`
Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 5. Rebuild the App
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Features Implemented

### 1. Login Screen
- Email/password login
- Pikachu animation using Lottie
- Google Sign-In option (requires additional configuration)
- Navigation to signup

### 2. Signup Screen
- Email/password registration
- Choose starter Pokemon (Bulbasaur, Charmander, Squirtle) from PokeAPI
- Password validation (minimum 6 characters)
- Confirmation password check

### 3. Authentication Context
- Global auth state management
- Auto-login for returning users
- Secure logout functionality

### 4. Protected Routes
- Pokedex only accessible when logged in
- Logout button in the header

## Troubleshooting

### Firebase not initialized
If you see "Firebase not initialized" errors:
- Ensure `google-services.json` is in `android/app/`
- Rebuild the app completely
- Check that the package name matches in Firebase and your app

### Google Sign-In issues
Google Sign-In requires additional setup:
1. Enable Google Sign-In in Firebase Console
2. Add SHA-1 certificate fingerprint in Firebase project settings
3. Configure @react-native-google-signin/google-signin properly

### Build errors
- Clean the build: `cd android && ./gradlew clean`
- Ensure all Firebase dependencies are properly installed
- Check that google-services plugin is applied

## Testing

### Test Accounts
You can create test accounts directly in the app using the signup screen.

### Firebase Console
Monitor users in Firebase Console under "Authentication" → "Users"

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- User profiles with trainer information
- Store selected starter Pokemon
- Social authentication (Facebook, Twitter)
- Anonymous authentication for quick testing

## Security Notes

- Never commit `google-services.json` to public repositories
- Add `.gitignore` entries for sensitive files
- Use Firebase Security Rules for production apps
- Implement proper error handling for all auth flows
