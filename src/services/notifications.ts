import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';
import { PokemonDetail } from '../types/pokemon';
import { capitalize } from '../utils/pokemon';

let isConfigured = false;

const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'Pokédex needs permission to notify you about nearby Pokémon.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions via Info.plist
};

export const configureNotifications = async (): Promise<void> => {
  if (isConfigured) {
    return;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  PushNotification.configure({
    onRegister: function (token) {
      console.log('Notification token:', token);
    },
    onNotification: function (notification) {
      console.log('Notification received:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create default channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'pokemon-nearby',
        channelName: 'Pokémon Nearby',
        channelDescription: 'Notifications for nearby Pokémon',
        playSound: true,
        soundName: 'default',
        importance: 4, // High importance
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`),
    );
  }

  isConfigured = true;
};

export const notifyNearbyPokemon = (pokemon: PokemonDetail, distance: number): void => {
  const distanceText = distance < 50 ? 'very close' : distance < 100 ? 'nearby' : 'in the area';

  PushNotification.localNotification({
    channelId: 'pokemon-nearby',
    title: `Pokémon Found!`,
    message: `${capitalize(pokemon.name)} is ${distanceText}!`,
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
    priority: 'high',
    importance: 'high',
    userInfo: {
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
    },
  });
};

export const cancelAllNotifications = (): void => {
  PushNotification.cancelAllLocalNotifications();
};

