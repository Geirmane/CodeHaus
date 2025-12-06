import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PokemonCard } from '../components/PokemonCard';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { usePokemonList } from '../hooks/usePokemonList';
import { MainStackParamList } from '../navigation/types';
import { startVoiceSearch, stopVoiceSearch, destroyVoiceSearch } from '../services/voiceSearch';

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
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pokédex</Text>
      <Text style={styles.headerSubtitle}>
        Search, filter, and deep dive into Pokémon data powered by PokéAPI.
      </Text>

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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorAction}>Pull to refresh</Text>
        </View>
      )}

      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PokemonCard pokemon={item} onPress={handleOpenDetail} />}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.3}
        onEndReached={hasMore ? loadMore : undefined}
        ListEmptyComponent={
          initialLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#ef5350" />
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
              <ActivityIndicator color="#ef5350" />
              <Text style={styles.footerText}>Fetching more Pokémon...</Text>
            </View>
          ) : !hasMore ? (
            <Text style={styles.footerText}>You have reached the end of the Pokédex.</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={initialLoading} onRefresh={loadInitial} tintColor="#ef5350" />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1f',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4a4a4f',
    marginTop: 4,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#ffe0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#b71c1c',
    fontWeight: '600',
  },
  errorAction: {
    color: '#7b7b85',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  loader: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#4a4a4f',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b1b1f',
  },
  emptySubtitle: {
    color: '#4a4a4f',
    textAlign: 'center',
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: '#7b7b85',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

