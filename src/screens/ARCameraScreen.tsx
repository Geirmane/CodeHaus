import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainStackParamList } from '../navigation/types';
import { PokemonDetail } from '../types/pokemon';
import { capitalize, getSpriteUri } from '../utils/pokemon';
import { fetchPokemonDetailBundle } from '../services/pokeApi';
import { DrawerMenu } from '../components/DrawerMenu';

type Props = NativeStackScreenProps<MainStackParamList, 'ARCamera'>;

export const ARCameraScreen = ({ navigation }: Props) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isActive, setIsActive] = useState(true);
  const [overlayPokemon, setOverlayPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  const loadRandomPokemon = async () => {
    try {
      setLoading(true);
      // Get a random Pokémon (1-151 for original 151)
      const randomId = Math.floor(Math.random() * 151) + 1;
      const bundle = await fetchPokemonDetailBundle(randomId);
      setOverlayPokemon(bundle.detail);
    } catch (error) {
      console.warn('Error loading Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!camera.current) {
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      setCapturedPhoto(`file://${photo.path}`);
      Alert.alert(
        'Photo Captured!',
        overlayPokemon ? `You captured ${capitalize(overlayPokemon.name)}!` : 'Photo saved!',
        [
          { text: 'Retake', onPress: () => setCapturedPhoto(null) },
          { text: 'OK', onPress: () => setCapturedPhoto(null) },
        ],
      );
    } catch (error) {
      console.warn('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
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
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ef5350" />
        <Text style={styles.loaderText}>Loading camera...</Text>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} resizeMode="contain" />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.previewButton} onPress={() => setCapturedPhoto(null)}>
            <Text style={styles.previewButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => {
              setCapturedPhoto(null);
              navigation.goBack();
            }}
          >
            <Text style={styles.previewButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const spriteUri = overlayPokemon ? getSpriteUri(overlayPokemon.sprites) : null;

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
        style={styles.camera}
        device={device}
        isActive={isActive}
        photo={true}
      />

      {overlayPokemon && spriteUri && (
        <View style={styles.overlay}>
          <View style={styles.pokemonOverlay}>
            <Image source={{ uri: spriteUri }} style={styles.overlayImage} resizeMode="contain" />
            <Text style={styles.overlayText}>{capitalize(overlayPokemon.name)}</Text>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={loadRandomPokemon}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.controlButtonText}>Spawn Pokémon</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {overlayPokemon && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setOverlayPokemon(null)}
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
    backgroundColor: '#000',
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
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  overlayImage: {
    width: 200,
    height: 200,
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
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
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewControls: {
    position: 'absolute',
    bottom: 40,
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
});

