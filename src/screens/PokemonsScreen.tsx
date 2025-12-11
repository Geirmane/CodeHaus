import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainStackParamList } from '../navigation/types';
import { getCapturedPhotos, subscribeToCapturedPhotos, CapturedPhoto } from '../services/photos';
import { useTheme } from '../context/ThemeContext';
import { capitalize } from '../utils/pokemon';
import { showShareOptions } from '../services/share';
import { useCaughtPokemon } from '../hooks/useCaughtPokemon';

type Props = NativeStackScreenProps<MainStackParamList, 'Pokemons'>;

export const PokemonsScreen = ({ navigation }: Props) => {
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isCaught } = useCaughtPokemon();

  // Subscribe to real-time photo updates
  useEffect(() => {
    const unsubscribe = subscribeToCapturedPhotos((photos) => {
      setCapturedPhotos(photos);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Initial load
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const photos = await getCapturedPhotos();
      setCapturedPhotos(photos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, [loadPhotos]);

  if (loading && capturedPhotos.length === 0) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.text }]}>Loading captured Pokémon...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Captured Pokémon</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {capturedPhotos.length} {capturedPhotos.length === 1 ? 'photo' : 'photos'}
        </Text>
      </View>

      {capturedPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pokémon captured yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Capture Pokémon with the AR Camera to see them here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={capturedPhotos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            // Check if the Pokémon in the photo has been caught
            const pokemonIsCaught = item.pokemonId ? isCaught(item.pokemonId) : false;
            // Show indicator if Pokémon is caught OR if photo was taken (photo itself is a capture)
            const showCaughtIndicator = pokemonIsCaught || item.pokemonId !== null;
            
            return (
              <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.photoContent}
                  onPress={() => {
                    // Could navigate to a detail view or show full image
                  }}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.photoURL }} style={styles.photoImage} resizeMode="cover" />
                  {showCaughtIndicator && (
                    <View style={styles.capturedIndicator}>
                      <View style={styles.pokeballTop} />
                      <View style={styles.pokeballCenter}>
                        <Text style={styles.capturedIndicatorText}>✓</Text>
                      </View>
                      <View style={styles.pokeballBottom} />
                    </View>
                  )}
                  {item.pokemonName && (
                    <View style={[styles.pokemonBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.pokemonBadgeText}>{capitalize(item.pokemonName)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  showShareOptions({
                    url: item.photoURL,
                    pokemonName: item.pokemonName || undefined,
                    message: item.pokemonName
                      ? `I just captured ${capitalize(item.pokemonName)} with AR! 🎮✨`
                      : 'Check out my AR Pokémon capture! 🎮✨',
                  });
                }}
              >
                <Text style={[styles.shareButtonText, { color: colors.primary }]}>📤 Share</Text>
              </TouchableOpacity>
            </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  grid: {
    padding: 12,
    paddingBottom: 100,
  },
  photoCard: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  photoContent: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  capturedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FF0000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pokeballCenter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pokeballBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  capturedIndicatorText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  pokemonBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pokemonBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  shareButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '100%',
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

