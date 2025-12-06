import Voice from '@react-native-voice/voice';
import { Platform, PermissionsAndroid } from 'react-native';

export type VoiceSearchResult = {
  text: string;
  isFinal: boolean;
};

let isInitialized = false;

// Check if Voice module is available
const isVoiceAvailable = (): boolean => {
  try {
    if (!Voice) {
      return false;
    }
    // Check if essential methods exist
    return (
      typeof Voice.start === 'function' &&
      typeof Voice.stop === 'function' &&
      typeof Voice.isAvailable === 'function'
    );
  } catch (error) {
    console.warn('Voice module not available:', error);
    return false;
  }
};

const requestMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Pokédex needs access to your microphone for voice search.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Microphone permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions via Info.plist
};

export const initializeVoiceSearch = async (): Promise<boolean> => {
  if (!isVoiceAvailable()) {
    console.error('Voice module is not available. Make sure @react-native-voice/voice is properly linked.');
    return false;
  }

  if (isInitialized) {
    return true;
  }

  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    console.warn('Microphone permission not granted');
    return false;
  }

  try {
    const available = await Voice.isAvailable();
    if (available) {
      isInitialized = true;
      return true;
    } else {
      console.warn('Voice recognition is not available on this device');
      return false;
    }
  } catch (error) {
    console.warn('Voice initialization error:', error);
    return false;
  }
};

export const startVoiceSearch = (
  onResult: (result: VoiceSearchResult) => void,
  onError: (error: Error) => void,
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if Voice module is available
      if (!isVoiceAvailable()) {
        const error = new Error('Voice recognition is not available. Please ensure the app is properly built and the voice module is linked.');
        onError(error);
        reject(error);
        return;
      }

      // Initialize voice search
      const initialized = await initializeVoiceSearch();
      if (!initialized) {
        const error = new Error('Failed to initialize voice search. Please check microphone permissions.');
        onError(error);
        reject(error);
        return;
      }

      // Set up event handlers
      Voice.onSpeechStart = () => {
        console.log('Voice search started');
      };

      Voice.onSpeechRecognized = () => {
        console.log('Speech recognized');
      };

      Voice.onSpeechEnd = () => {
        console.log('Voice search ended');
      };

      Voice.onSpeechError = (e) => {
        console.error('Speech error:', e);
        const errorMessage = e.error?.message || e.error || 'Voice recognition error';
        const error = new Error(errorMessage);
        onError(error);
        reject(error);
      };

      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) {
          const text = e.value[0];
          onResult({
            text: text.trim(),
            isFinal: true,
          });
        }
      };

      Voice.onSpeechPartialResults = (e) => {
        if (e.value && e.value.length > 0) {
          const text = e.value[0];
          onResult({
            text: text.trim(),
            isFinal: false,
          });
        }
      };

      // Start voice recognition
      await Voice.start('en-US');
      resolve();
    } catch (error) {
      console.error('Error starting voice search:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error) || 'Failed to start voice search';
      const err = new Error(errorMessage);
      onError(err);
      reject(err);
    }
  });
};

export const stopVoiceSearch = async (): Promise<void> => {
  try {
    if (!isVoiceAvailable()) {
      return;
    }
    await Voice.stop();
    await Voice.cancel();
  } catch (error) {
    console.warn('Error stopping voice search:', error);
  }
};

export const destroyVoiceSearch = async (): Promise<void> => {
  try {
    if (!isVoiceAvailable()) {
      isInitialized = false;
      return;
    }
    await Voice.destroy();
    isInitialized = false;
  } catch (error) {
    console.warn('Error destroying voice search:', error);
    isInitialized = false;
  }
};

