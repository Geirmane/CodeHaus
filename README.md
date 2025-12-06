This project extends the default React Native template into a mini Pokédex experience with:

- Incremental list loading backed by PokéAPI
- Search & filtering by name, type, or Pokédex ID
- A dedicated detail screen showing flavor text, stats, and evolution chain
- Offline caching (AsyncStorage) for the most recent list + detail payloads
- Firebase Auth (email/password + Google) with Firestore-powered user profiles

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Install JS dependencies

```sh
npm install
cd ios && pod install && cd ..
```

This pulls in the newly added React Navigation, Gesture Handler, Reanimated, and AsyncStorage packages. Reanimated already has its Babel plugin enabled (see `babel.config.js`).

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

# Feature guide

| Area | Details |
| --- | --- |
| Pokédex list | `src/screens/PokedexScreen.tsx` uses `usePokemonList` to load/cached pages, expose search+type chips, and navigate to detail |
| Detail screen | `src/screens/PokemonDetailScreen.tsx` pulls species + evolution data, with pull-to-refresh and cached fallback |
| Offline cache | Implemented via AsyncStorage (`src/storage/pokemonCache.ts`) with 12h TTL for list + per-Pokémon detail bundles |
| Navigation | Native stack navigation configured in `App.tsx` with gesture handler + safe area provider |

## Offline-first behavior

1. On launch the list attempts to hydrate from cache before calling PokéAPI.
2. Detail views read from cache immediately when available, then refresh in the background.
3. Errors while offline surface a banner but keep cached data visible.
4. Pull-to-refresh re-runs the network requests.

## Firebase auth + social sign-in

The app now gates navigation through `AuthProvider` (`src/context/AuthContext.tsx`) and offers:

- **Email/password** sign-up + sign-in (`src/screens/Auth/*`) backed by `@react-native-firebase/auth`.
- **Google Sign-In** (Android-first): configure it once and users can tap “Continue with Google” on the sign-in screen.

### Configure Google Sign-In

1. In the Firebase console, enable the **Google** provider under **Authentication > Sign-in method**.
2. From **Project settings > General**, copy the **Web client ID** for your Android app (it ends with `.apps.googleusercontent.com`).
3. Update `WEB_CLIENT_ID` inside `src/firebase/googleSignIn.ts` with that value. Until you do, the app will warn at startup and the Google button will stay disabled.
4. (Optional iOS) Add the reversed client ID to your Xcode URL types once you can run the project on macOS.

The JS side automatically calls `configureGoogleSignIn()` on launch (see `App.tsx`). On success, `signInWithGoogle()` exchanges the Google token for Firebase credentials and seeds the Firestore profile just like the email flow.

## Next steps

The remaining backlog from the spec (personal Pokédex UI, Hunt map, camera/voice/AR integrations, etc.) can build on this structure. Global state (Redux/Context), permissions flows, and device feature hooks will slot in under `src/` alongside the new modules.
