# Gradle Build Fixes Applied

## Issue
Several React Native libraries were using deprecated `jcenter()` repository which has been removed from newer Gradle versions.

## Fixes Applied

### 1. react-native-push-notification
**File:** `node_modules/react-native-push-notification/android/build.gradle`
- Removed `jcenter()` from buildscript repositories
- Removed `jcenter()` from allprojects repositories

### 2. react-native-sensors
**File:** `node_modules/react-native-sensors/android/build.gradle`
- Removed `jcenter()` from repositories block
- Removed `jcenter()` from buildscript repositories
- Replaced with `mavenCentral()`

### 3. @react-native-voice/voice
**File:** `node_modules/@react-native-voice/voice/android/build.gradle`
- Removed `jcenter()` from repositories block
- Removed `jcenter()` from buildscript repositories
- Removed `jcenter()` from allprojects repositories
- Added `mavenCentral()` and `google()` repositories
- Added explicit `compileSdk` property

## Note
These fixes are in `node_modules` and will be lost if you run `npm install` again. Consider using:
- `patch-package` to persist these fixes
- Or wait for library updates that remove jcenter()

## Using patch-package (Recommended)

1. Install patch-package:
```bash
npm install --save-dev patch-package
```

2. After making changes to node_modules, create patches:
```bash
npx patch-package react-native-push-notification
npx patch-package react-native-sensors
npx patch-package @react-native-voice/voice
```

3. Add to package.json scripts:
```json
"scripts": {
  "postinstall": "patch-package"
}
```

This will automatically apply patches after npm install.

