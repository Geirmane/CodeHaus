import { useCallback, useEffect, useMemo, useState } from 'react';

import { PAGE_SIZE, POKEMON_TYPES } from '../constants/pokemon';
import { fetchPokemonBatch } from '../services/pokeApi';
import { loadPokemonListCache, savePokemonListCache } from '../storage/pokemonCache';
import { PokemonDetail } from '../types/pokemon';

export const usePokemonList = () => {
  const [pokemon, setPokemon] = useState<PokemonDetail[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextOffset, setNextOffset] = useState(PAGE_SIZE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const loadFromCache = useCallback(async () => {
    const cache = await loadPokemonListCache();
    if (cache) {
      setPokemon(cache.items);
      setHasMore(cache.hasMore);
      setNextOffset(cache.nextOffset);
      return true;
    }
    return false;
  }, []);

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    const hadCache = await loadFromCache();
    try {
      const { details, hasNext } = await fetchPokemonBatch(0, PAGE_SIZE);
      setPokemon(details);
      setHasMore(hasNext);
      setNextOffset(details.length);
      await savePokemonListCache({
        items: details,
        hasMore: hasNext,
        nextOffset: details.length,
      });
    } catch (err) {
      if (!hadCache) {
        setError(err instanceof Error ? err.message : 'Unable to load Pokémon right now.');
      } else {
        setError('Showing cached data – pull to refresh when you are back online.');
      }
    } finally {
      setInitialLoading(false);
    }
  }, [loadFromCache]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const { details, hasNext } = await fetchPokemonBatch(nextOffset, PAGE_SIZE);
      setPokemon((prev) => {
        const merged = [...prev, ...details];
        void savePokemonListCache({
          items: merged,
          hasMore: hasNext,
          nextOffset: merged.length,
        });
        return merged;
      });
      setHasMore(hasNext);
      setNextOffset((prev) => prev + details.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load additional Pokémon.');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextOffset]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((item) => {
      const matchesType = selectedType
        ? item.types.some((typeEntry) => typeEntry.type.name === selectedType)
        : true;

      if (!normalizedSearch) {
        return matchesType;
      }

      const nameMatch = item.name.toLowerCase().includes(normalizedSearch);
      const idMatch = item.id.toString() === normalizedSearch || item.id.toString().includes(normalizedSearch);
      const typeMatch = item.types.some((typeEntry) =>
        typeEntry.type.name.toLowerCase().includes(normalizedSearch),
      );
      const abilityMatch = item.abilities.some((abilityEntry) =>
        abilityEntry.ability.name.toLowerCase().includes(normalizedSearch),
      );

      return matchesType && (nameMatch || idMatch || typeMatch || abilityMatch);
    });
  }, [normalizedSearch, pokemon, selectedType]);

  const availableTypes = useMemo(() => {
    const discoveredTypes = new Set<string>(POKEMON_TYPES);
    pokemon.forEach((p) => p.types.forEach((type) => discoveredTypes.add(type.type.name)));
    return Array.from(discoveredTypes).sort();
  }, [pokemon]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedType(null);
  };

  return {
    pokemon,
    filteredPokemon,
    hasMore,
    initialLoading,
    loadingMore,
    error,
    loadInitial,
    loadMore,
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    availableTypes,
    clearFilters,
  };
};

