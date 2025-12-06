import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { MainStackParamList } from '../navigation/types';
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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      destroyVoiceSearch();
    };
  }, []);

  const handleVoiceSearch = useCallback(async () => {
    try {
      setIsVoiceSearching(true);

      await startVoiceSearch(
        (result) => {
          if (result.isFinal) {
            setSearchText(result.text);
            setIsVoiceSearching(false);
            stopVoiceSearch();
          }
        },
        (error) => {
          setIsVoiceSearching(false);
          Alert.alert('Voice Search Error', error.message);
          stopVoiceSearch();
        },
      );
    } catch (error) {
      setIsVoiceSearching(false);
      Alert.alert('Error', 'Failed to start voice search');
    }
  }, [setSearchText]);

  const handleOpenDetail = useCallback(
    (pokemonId: number, name: string) => {
      navigation.navigate('PokemonDetail', { pokemonId, name });
    },
    [navigation],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* ✅ HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pokédex</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        topOffset={20}
      />

      {/* ✅ ERROR */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorAction}>Pull to refresh</Text>
        </View>
      )}

      {/* ✅ POKÉMON LIST */}
      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} onPress={handleOpenDetail} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 200 + insets.bottom }, // ✅ space for filter chips + search bar + tab bar
        ]}
        onEndReachedThreshold={0.3}
        onEndReached={hasMore ? loadMore : undefined}
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#FF6B9D" />
              <Text style={styles.loaderText}>Loading Pokédex...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Pokémon found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term or clear your filters.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#FF6B9D" />
              <Text style={styles.footerText}>Fetching more Pokémon...</Text>
            </View>
          ) : !hasMore ? (
            <Text style={styles.footerText}>
              You have reached the end of the Pokédex.
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={initialLoading}
            onRefresh={loadInitial}
            tintColor="#FF6B9D"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ SEARCH BAR MOVED TO BOTTOM */}
      <View
        style={[
          styles.bottomSearchContainer,
          { bottom: 70 + insets.bottom }, // ✅ Position closer to tab bar
        ]}
      >
        <SearchAndFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
          availableTypes={availableTypes}
          onClear={clearFilters}
          onVoiceSearch={handleVoiceSearch}
          isVoiceSearching={isVoiceSearching}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
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
    fontSize: 40,
    fontWeight: '900',
    color: '#FF6B9D',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(255, 107, 157, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#FF6B9D',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFE5ED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  menuButtonText: {
    fontSize: 24,
    color: '#FF6B9D',
    fontWeight: '700',
  },

  errorBanner: {
    backgroundColor: '#FFE5ED',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B9D',
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },

  errorText: {
    color: '#FF6B9D',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  errorAction: {
    color: '#FF6B9D',
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
    color: '#FF6B9D',
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
    color: '#FF6B9D',
    letterSpacing: 0.5,
  },

  emptySubtitle: {
    color: '#FF6B9D',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },

  footerLoader: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },

  footerText: {
    color: '#FF6B9D',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ✅ BOTTOM SEARCH BAR */
  bottomSearchContainer: {
    position: 'absolute',
    left: 18,
    right: 18,
    backgroundColor: '#FFF5F8',
    borderTopWidth: 2,
    borderColor: '#FFE5ED',
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
});
