import Voice from '@react-native-voice/voice';
import { Platform, PermissionsAndroid } from 'react-native';

export type VoiceSearchResult = {
  text: string;
  isFinal: boolean;
};

let isInitialized = false;

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
  if (isInitialized) {
    return true;
  }

  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    return false;
  }

  try {
    await Voice.isAvailable();
    isInitialized = true;
    return true;
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
      await initializeVoiceSearch();

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
        const error = new Error(e.error?.message || 'Voice recognition error');
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

      await Voice.start('en-US');
      resolve();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start voice search');
      onError(err);
      reject(err);
    }
  });
};

export const stopVoiceSearch = async (): Promise<void> => {
  try {
    await Voice.stop();
    await Voice.cancel();
  } catch (error) {
    console.warn('Error stopping voice search:', error);
  }
};

export const destroyVoiceSearch = async (): Promise<void> => {
  try {
    await Voice.destroy();
    isInitialized = false;
  } catch (error) {
    console.warn('Error destroying voice search:', error);
  }
};

