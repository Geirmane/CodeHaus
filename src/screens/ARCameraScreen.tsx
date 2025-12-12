import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { MainStackParamList } from '../navigation/types';
import { PokemonDetail } from '../types/pokemon';
import { capitalize, getSpriteUri } from '../utils/pokemon';
import { fetchPokemonDetailBundle } from '../services/pokeApi';
import { DrawerMenu } from '../components/DrawerMenu';
import { saveCapturedPhoto } from '../services/photos';
import { saveCaughtPokemon } from '../services/caughtPokemon';
import { useTheme } from '../context/ThemeContext';
import { showShareOptions } from '../services/share';
import RNFS from 'react-native-fs';

type Props = NativeStackScreenProps<MainStackParamList, 'ARCamera'>;

export const ARCameraScreen = ({ navigation }: Props) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(true);
  const [currentPokemon, setCurrentPokemon] = useState<{
    pokemon: PokemonDetail;
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const spawnPositionSeedRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Manage camera active state based on screen focus
  useFocusEffect(
    useCallback(() => {
      // Activate camera when screen is focused
      setIsActive(true);
      
      return () => {
        // Deactivate camera when screen loses focus
        setIsActive(false);
      };
    }, [])
  );


  const loadRandomPokemon = useCallback(async () => {
    // Don't load if camera is not active
    // Also don't load if there's already a Pokémon on screen (user must interact with it first)
    if (!isActive || currentPokemon) {
      return;
    }

    try {
      setLoading(true);
      // Get a random Pokémon (1-151 for original 151)
      const randomId = Math.floor(Math.random() * 151) + 1;
      const bundle = await fetchPokemonDetailBundle(randomId);
      
      // Spawn Pokémon in the center of the screen
      // Center position (50% from left, 40% from top to account for controls at bottom)
      const x = 50; // Center horizontally
      const y = 40; // Center vertically (slightly above center to avoid controls)
      
      const newPokemon = {
        pokemon: bundle.detail,
        id: `${bundle.detail.id}_${Date.now()}`,
        x,
        y,
      };

      // Only set if there's no current Pokémon
      if (!currentPokemon) {
        setCurrentPokemon(newPokemon);
      }
    } catch (error) {
      console.warn('Error loading Pokémon:', error);
    } finally {
      setLoading(false);
    }
  }, [isActive, currentPokemon]);

  // Update spawn position seed periodically to vary positions
  useEffect(() => {
    if (!isActive) return;
    
    const positionUpdateInterval = setInterval(() => {
      spawnPositionSeedRef.current = (spawnPositionSeedRef.current + 1) % 10000;
    }, 2000); // Update every 2 seconds to create variation
    
    return () => clearInterval(positionUpdateInterval);
  }, [isActive]);

  // Auto-spawn Pokémon at random intervals (only if no Pokémon is currently on screen)
  useEffect(() => {
    if (!isActive || !hasPermission || !device || currentPokemon) {
      return;
    }

    // Spawn first Pokémon after a short delay
    const initialDelay = setTimeout(() => {
      if (!currentPokemon) {
        loadRandomPokemon();
      }
    }, 2000);

    // Set up interval for random spawning
    // Random interval between 8-15 seconds
    const getRandomInterval = () => Math.floor(Math.random() * 7000) + 8000;

    let intervalId: ReturnType<typeof setTimeout>;
    const scheduleNextSpawn = () => {
      intervalId = setTimeout(() => {
        if (!currentPokemon) {
          loadRandomPokemon();
          scheduleNextSpawn(); // Schedule the next spawn
        }
      }, getRandomInterval());
    };

    // Start the spawn cycle after initial delay
    const cycleDelay = setTimeout(() => {
      scheduleNextSpawn();
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(cycleDelay);
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [isActive, hasPermission, device, currentPokemon, loadRandomPokemon]);

  // Don't auto-clear Pokémon - only clear when user chooses to run away or after capture

  const takePhoto = async () => {
    if (!camera.current) {
      return;
    }

    // Prevent multiple simultaneous capture operations
    if (savingPhoto) {
      console.log('Capture operation already in progress');
      return;
    }

    // Get the current Pokémon in the photo before capturing
    const pokemonInPhoto = currentPokemon;
    
    // Clear the pokemon immediately so it disappears from view
    setCurrentPokemon(null);

    try {
      setSavingPhoto(true);
      
      // Take the camera photo
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      console.log('Photo captured with path:', photo.path);
      console.log('Pokémon in photo:', pokemonInPhoto?.pokemon.name);
      
      // Add a small delay to ensure the file is fully written
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
      
      // Save photo locally and store metadata in Firestore
      await saveCapturedPhoto(
        photo.path,
        pokemonInPhoto?.pokemon.id,
        pokemonInPhoto?.pokemon.name,
      );
      
      // Also save to caught pokemon collection (allows multiple captures)
      if (pokemonInPhoto) {
        try {
          await saveCaughtPokemon(
            pokemonInPhoto.pokemon.id,
            pokemonInPhoto.pokemon.name,
          );
        } catch (error) {
          console.error('Error saving caught pokemon:', error);
          // Don't fail the whole operation if caught pokemon save fails
        }
      }
      
      console.log('Photo saved successfully, showing alert...');
      
      // Reset saving state before showing alert
      setSavingPhoto(false);
      
      // Show success message - use requestAnimationFrame to ensure UI is ready
      requestAnimationFrame(() => {
        Alert.alert(
          'Captured Successfully!',
          pokemonInPhoto ? `You captured ${capitalize(pokemonInPhoto.pokemon.name)}!` : 'Photo captured successfully!',
          [{ text: 'OK' }],
        );
      });
    } catch (error: any) {
      console.error('Error capturing photo:', error);
      console.error('Error message:', error?.message);
      
      // Reset saving state on error
      setSavingPhoto(false);
      
      const errorMessage = error?.message || 'Failed to capture photo. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.text }]}>Loading camera...</Text>
        <Text style={[styles.loaderSubtext, { color: colors.textSecondary }]}>
          No camera device found. Please check your device settings.
        </Text>
      </View>
    );
  }



  const { width, height } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.menuButton, { top: insets.top + 20 }]}
        onPress={() => setDrawerVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>

      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)}
        topOffset={20}
        navigation={navigation}
      />

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && hasPermission}
        photo={true}
      />

      {/* Render current Pokémon at its position */}
      {currentPokemon && (() => {
        const spriteUri = getSpriteUri(currentPokemon.pokemon.sprites);
        if (!spriteUri) return null;
        
        return (
          <View
            key={currentPokemon.id}
            style={styles.pokemonOverlayContainer}
          >
            <View style={styles.pokemonOverlay}>
              <Image source={{ uri: spriteUri }} style={styles.overlayImage} resizeMode="contain" />
              <Text style={styles.overlayText}>{capitalize(currentPokemon.pokemon.name)}</Text>
            </View>
          </View>
        );
      })()}

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePhoto} 
          activeOpacity={0.8}
          disabled={savingPhoto}
        >
          <LottieView
            source={require('../../assets/Pokeball.json')}
            autoPlay
            loop
            style={styles.pokeballAnimation}
          />
        </TouchableOpacity>

        {currentPokemon && (
          <TouchableOpacity
            style={styles.runButton}
            onPress={() => setCurrentPokemon(null)}
          >
            <Text style={styles.runButtonText}>Run</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 3,
    borderColor: '#FFE5ED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  camera: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pokemonOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    alignItems: 'center',
    transform: [{ translateY: -150 }], // Center vertically (half of 300 height)
  },
  pokemonOverlay: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 250,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  overlayImage: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    height: 80,
    zIndex: 1000,
  },
  captureButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -50, // Half of button width (100/2) to center it
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  pokeballAnimation: {
    width: 100,
    height: 100,
  },
  runButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: 70, // Position to the right of capture button (50px half-width + 20px gap)
    top: '50%',
    marginTop: -18, // Half of button height to center vertically
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  runButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    padding: 16,
    gap: 16,
  },
  permissionText: {
    color: '#4a4a4f',
    fontSize: 16,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    gap: 12,
  },
  loaderText: {
    color: '#4a4a4f',
    marginTop: 12,
    fontSize: 16,
  },
  loaderSubtext: {
    color: '#4a4a4f',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
