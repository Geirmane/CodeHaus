import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

export type Location = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type LocationError = {
  code: number;
  message: string;
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Pokédex needs access to your location to find nearby Pokémon.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions via Info.plist
};

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

export const watchLocation = (
  onSuccess: (location: Location) => void,
  onError: (error: LocationError) => void,
): number => {
  return Geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: error.message,
      } as LocationError);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 5000, // Update every 5 seconds
    },
  );
};

export const clearWatch = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};

export const requestLocationAccess = async (): Promise<boolean> => {
  return await requestLocationPermission();
};

// Biome detection based on coordinates
export type Biome = 'urban' | 'rural' | 'water' | 'forest' | 'mountain' | 'unknown';

export const detectBiome = (location: Location): Biome => {
  // Simple biome detection based on coordinates
  // In a real app, you'd use Google Maps API or other services
  const { latitude, longitude } = location;

  // Example logic (you can enhance this with actual map data)
  // Water biome: near coastlines or specific coordinates
  if (Math.abs(latitude) < 0.1 && Math.abs(longitude) < 0.1) {
    return 'water';
  }

  // Urban: higher population density areas (simplified)
  if (Math.abs(latitude) > 30 && Math.abs(latitude) < 50) {
    return 'urban';
  }

  // Forest: certain latitude ranges
  if (Math.abs(latitude) > 40 && Math.abs(latitude) < 60) {
    return 'forest';
  }

  // Mountain: high altitude areas (simplified)
  if (Math.abs(latitude) > 45) {
    return 'mountain';
  }

  return 'rural';
};

// Get Pokémon types that spawn in a biome
export const getBiomePokemonTypes = (biome: Biome): string[] => {
  const biomeTypes: Record<Biome, string[]> = {
    urban: ['normal', 'electric', 'poison', 'psychic'],
    rural: ['normal', 'grass', 'ground', 'bug'],
    water: ['water', 'ice', 'flying'],
    forest: ['grass', 'bug', 'flying', 'normal'],
    mountain: ['rock', 'ground', 'ice', 'steel'],
    unknown: ['normal'],
  };

  return biomeTypes[biome] || ['normal'];
};

