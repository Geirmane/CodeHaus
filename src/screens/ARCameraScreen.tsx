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
  ScrollView,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { MainStackParamList } from '../navigation/types';
import { PokemonDetail } from '../types/pokemon';
import { capitalize, getSpriteUri } from '../utils/pokemon';
import { fetchPokemonDetailBundle } from '../services/pokeApi';
import { DrawerMenu } from '../components/DrawerMenu';
import { saveCapturedPhoto, subscribeToCapturedPhotos, CapturedPhoto } from '../services/photos';
import { useTheme } from '../context/ThemeContext';

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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
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

  useEffect(() => {
    const unsubscribe = subscribeToCapturedPhotos((photos) => {
      setCapturedPhotos(photos);
    });
    return unsubscribe;
  }, []);

  const loadRandomPokemon = useCallback(async () => {
    // Don't load if camera is not active or in preview/gallery mode
    if (!isActive || capturedPhoto || showGallery) {
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

      // Replace current Pokémon instead of adding to array
      setCurrentPokemon(newPokemon);
      // Update seed for next spawn position variation
      spawnPositionSeedRef.current = (seed % 1000);
    } catch (error) {
      console.warn('Error loading Pokémon:', error);
    } finally {
      setLoading(false);
    }
  }, [isActive, capturedPhoto, showGallery]);

  // Update spawn position seed periodically to vary positions
  useEffect(() => {
    if (!isActive) return;
    
    const positionUpdateInterval = setInterval(() => {
      spawnPositionSeedRef.current = (spawnPositionSeedRef.current + 1) % 10000;
    }, 2000); // Update every 2 seconds to create variation
    
    return () => clearInterval(positionUpdateInterval);
  }, [isActive]);

  // Auto-spawn Pokémon at random intervals
  useEffect(() => {
    if (!isActive || capturedPhoto || showGallery || !hasPermission || !device) {
      return;
    }

    // Spawn first Pokémon after a short delay
    const initialDelay = setTimeout(() => {
      loadRandomPokemon();
    }, 2000);

    // Set up interval for random spawning
    // Random interval between 8-15 seconds
    const getRandomInterval = () => Math.floor(Math.random() * 7000) + 8000;

    let intervalId: NodeJS.Timeout;
    const scheduleNextSpawn = () => {
      intervalId = setTimeout(() => {
        loadRandomPokemon();
        scheduleNextSpawn(); // Schedule the next spawn
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
  }, [isActive, capturedPhoto, showGallery, hasPermission, device, loadRandomPokemon]);

  // Clear Pokémon when leaving camera view
  useEffect(() => {
    if (showGallery) {
      // Keep Pokémon when viewing gallery
      return;
    }
    if (!isActive) {
      setCurrentPokemon(null);
    }
  }, [isActive, showGallery]);

  const takePhoto = async () => {
    if (!camera.current) {
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      // vision-camera returns absolute path, use it directly
      // Add file:// prefix for Image component to display it
      setCapturedPhoto(`file://${photo.path}`);
    } catch (error) {
      console.warn('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleSavePhoto = async () => {
    if (!capturedPhoto) return;

    try {
      setSavingPhoto(true);
      // Get the current Pokémon in the photo
      const pokemonInPhoto = currentPokemon;
      
      console.log('Saving photo with path:', capturedPhoto);
      console.log('Pokémon in photo:', pokemonInPhoto?.pokemon.name);
      
      await saveCapturedPhoto(
        capturedPhoto,
        pokemonInPhoto?.pokemon.id,
        pokemonInPhoto?.pokemon.name,
      );
      Alert.alert(
        'Photo Saved!',
        pokemonInPhoto ? `You captured ${capitalize(pokemonInPhoto.pokemon.name)}!` : 'Photo saved to gallery!',
        [
          { text: 'View Gallery', onPress: () => { setCapturedPhoto(null); setShowGallery(true); } },
          { text: 'OK', onPress: () => setCapturedPhoto(null) },
        ],
      );
    } catch (error: any) {
      console.error('Error saving photo:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Failed to save photo';
      if (error?.code === 'storage/object-not-found') {
        errorMessage = 'Photo file not found. Please try capturing again.';
      } else if (error?.code === 'storage/unauthorized') {
        errorMessage = 'Permission denied. Please check your account settings.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSavingPhoto(false);
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

  if (showGallery) {
    return (
      <View style={[styles.galleryContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.galleryHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowGallery(false)}>
            <Text style={[styles.galleryBackButton, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.galleryTitle, { color: colors.text }]}>AR Camera Gallery</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView
          style={styles.galleryScroll}
          contentContainerStyle={styles.galleryGrid}
          showsVerticalScrollIndicator={false}
        >
          {capturedPhotos.length === 0 ? (
            <View style={styles.emptyGallery}>
              <Text style={[styles.emptyGalleryText, { color: colors.textSecondary }]}>
                No AR photos captured yet
              </Text>
              <Text style={[styles.emptyGallerySubtext, { color: colors.textSecondary }]}>
                Take photos with the AR camera to see them here!
              </Text>
            </View>
          ) : (
            capturedPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={[styles.galleryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setShowGallery(false);
                  setCapturedPhoto(photo.photoURL);
                }}
              >
                <Image source={{ uri: photo.photoURL }} style={styles.galleryImage} resizeMode="cover" />
                {photo.pokemonName && (
                  <View style={[styles.galleryBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.galleryBadgeText}>{capitalize(photo.pokemonName)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} resizeMode="contain" />
        
        {/* Show Pokémon overlay on the preview image */}
        {currentPokemon && (() => {
          const spriteUri = getSpriteUri(currentPokemon.pokemon.sprites);
          if (!spriteUri) return null;
          
          return (
            <View
              key={currentPokemon.id}
              style={[
                styles.pokemonOverlayContainer,
                {
                  left: `${currentPokemon.x}%`,
                  top: `${currentPokemon.y}%`,
                },
              ]}
            >
              <View style={styles.pokemonOverlay}>
                <Image source={{ uri: spriteUri }} style={styles.overlayImage} resizeMode="contain" />
                <Text style={styles.overlayText}>{capitalize(currentPokemon.pokemon.name)}</Text>
              </View>
            </View>
          );
        })()}
        
        <View style={[styles.previewControls, { bottom: 100 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.previewButton, { backgroundColor: colors.surface }]}
            onPress={() => setCapturedPhoto(null)}
          >
            <Text style={[styles.previewButtonText, { color: colors.text }]}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.previewButton, { backgroundColor: colors.primary }]}
            onPress={handleSavePhoto}
            disabled={savingPhoto}
          >
            {savingPhoto ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.previewButtonText, { color: '#FFFFFF' }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // This line is no longer needed as we render multiple Pokémon directly

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
            style={[
              styles.pokemonOverlayContainer,
              {
                left: `${currentPokemon.x}%`,
                top: `${currentPokemon.y}%`,
              },
            ]}
          >
            <View style={styles.pokemonOverlay}>
              <Image source={{ uri: spriteUri }} style={styles.overlayImage} resizeMode="contain" />
              <Text style={styles.overlayText}>{capitalize(currentPokemon.pokemon.name)}</Text>
            </View>
          </View>
        );
      })()}

      <View style={[styles.controls, { bottom: 100 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowGallery(true)}
        >
          <Text style={styles.controlButtonText}>📷 Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {currentPokemon && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setCurrentPokemon(null)}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
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
    transform: [{ translateX: -125 }, { translateY: -150 }], // Center the overlay on the position (half of 250 width/height)
  },
  pokemonOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 250,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  overlayImage: {
    width: 250,
    height: 250,
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ef5350',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef5350',
  },
  clearButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  previewButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  galleryContainer: {
    flex: 1,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  galleryBackButton: {
    fontSize: 18,
    fontWeight: '700',
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  galleryScroll: {
    flex: 1,
  },
  galleryGrid: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  galleryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyGallery: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyGalleryText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyGallerySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

