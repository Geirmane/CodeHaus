import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonCard } from '../components/PokemonCard';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { DrawerMenu } from '../components/DrawerMenu';
import { usePokemonList } from '../hooks/usePokemonList';
import { useCaughtPokemon } from '../hooks/useCaughtPokemon';
import { MainStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { subscribeToCapturedPhotos } from '../services/photos';
import {
  startVoiceSearch,
  stopVoiceSearch,
  destroyVoiceSearch,
} from '../services/voiceSearch';

type Props = NativeStackScreenProps<MainStackParamList, 'Pokedex'>;

export const PokedexScreen = ({ navigation }: Props) => {
  const {
    filteredPokemon,
    initialLoading,
    loadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    availableTypes,
    clearFilters,
  } = usePokemonList();

  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [capturedPokemonIds, setCapturedPokemonIds] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const { isCaught } = useCaughtPokemon();
  const bottomSearchBarOpacity = useRef(new Animated.Value(0)).current;
  const bottomSearchBarTranslateY = useRef(new Animated.Value(20)).current;

  // Subscribe to captured photos for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToCapturedPhotos((photos) => {
      const ids = new Set<number>();
      photos.forEach(photo => {
        if (photo.pokemonId) {
          ids.add(photo.pokemonId);
        }
      });
      setCapturedPokemonIds(ids);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      destroyVoiceSearch();
    };
  }, []);

  // Animate bottom search bar based on scroll state, search text, or focus
  useEffect(() => {
    // Show search bar when scrolling, typing, or focused
    const shouldShow = isScrolling || isSearchFocused || searchText.length > 0;
    
    if (shouldShow) {
      // Show search bar
      Animated.parallel([
        Animated.timing(bottomSearchBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomSearchBarTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide search bar when not scrolling, not typing, and not focused
      Animated.parallel([
        Animated.timing(bottomSearchBarOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomSearchBarTranslateY, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScrolling, isSearchFocused, searchText]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > 50; // Show when scrolled more than 50px

    if (shouldShow !== isScrolling) {
      setIsScrolling(shouldShow);
    }
  }, [isScrolling]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY <= 50) {
      setIsScrolling(false);
    }
  }, []);


  const handleVoiceSearch = useCallback(async () => {
    try {
      setIsVoiceSearching(true);

      await startVoiceSearch(
        (result) => {
          if (result.isFinal) {
            setSearchText(result.text);
            setIsVoiceSearching(false);
            stopVoiceSearch().catch((err) => {
              console.warn('Error stopping voice search:', err);
            });
          }
        },
        (error) => {
          setIsVoiceSearching(false);
          console.error('Voice search error:', error);
          Alert.alert(
            'Voice Search Error',
            error.message || 'Failed to start voice search. Please check microphone permissions and try again.',
            [
              {
                text: 'OK',
                style: 'default',
              },
            ]
          );
          stopVoiceSearch().catch((err) => {
            console.warn('Error stopping voice search after error:', err);
          });
        },
      );
    } catch (error) {
      setIsVoiceSearching(false);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to start voice search. Please ensure the app is properly built and microphone permissions are granted.';
      console.error('Voice search catch error:', error);
      Alert.alert('Error', errorMessage);
      stopVoiceSearch().catch((err) => {
        console.warn('Error stopping voice search in catch:', err);
      });
    }
  }, [setSearchText]);

  const handleOpenDetail = useCallback(
    (pokemonId: number, name: string) => {
      navigation.navigate('PokemonDetail', { pokemonId, name });
    },
    [navigation],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
      {/* ✅ HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Pokédex
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuButtonText, { color: colors.primary }]}>☰</Text>
        </TouchableOpacity>
      </View>

      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        topOffset={20}
      />

      {/* ✅ ERROR */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.primaryLight, borderColor: colors.borderLight, borderLeftColor: colors.primary }]}>
          <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
          <Text style={[styles.errorAction, { color: colors.primary }]}>Pull to refresh</Text>
        </View>
      )}

      {/* ✅ POKÉMON LIST */}
      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            onPress={handleOpenDetail}
            isCaught={isCaught(item.id)}
            isCapturedInPhoto={capturedPokemonIds.has(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 250 + insets.bottom }, // ✅ space for filter chips + search bar + tab bar + footer
        ]}
        onEndReachedThreshold={0.3}
        onEndReached={hasMore ? loadMore : undefined}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loaderText, { color: colors.primary }]}>Loading Pokédex...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.primary }]}>No Pokémon found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.primary }]}>
                Try a different search term or clear your filters.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.footerText, { color: colors.primary }]}>Fetching more Pokémon...</Text>
            </View>
          ) : !hasMore ? (
            <Text style={[styles.footerText, { color: colors.primary }]}>
              You have reached the end of the Pokédex.
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={initialLoading}
            onRefresh={loadInitial}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ BOTTOM SEARCH BAR - Shows when scrolling, typing, or focused */}
      <Animated.View
        style={[
          styles.bottomSearchContainer,
          {
            bottom: 70 + insets.bottom,
            backgroundColor: colors.background,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: bottomSearchBarOpacity,
            transform: [{ translateY: bottomSearchBarTranslateY }],
          },
        ]}
        pointerEvents={isScrolling || isSearchFocused || searchText.length > 0 ? 'auto' : 'none'}
      >
        <SearchAndFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          availableTypes={availableTypes}
          onClear={clearFilters}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerContent: {
    flex: 1,
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#FF6B9D',
    marginTop: 8,
    fontWeight: '400',
  },

  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  menuButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },

  errorBanner: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderWidth: 2,
  },

  errorText: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  errorAction: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },

  listContent: {
    paddingTop: 10,
  },

  loader: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 14,
  },

  loaderText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  emptySubtitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },

  footerLoader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
    gap: 10,
  },

  footerText: {
    textAlign: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ✅ BOTTOM SEARCH BAR - Only shows when scrolling */
  bottomSearchContainer: {
    position: 'absolute',
    left: 18,
    right: 18,
    borderTopWidth: 2,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
});
