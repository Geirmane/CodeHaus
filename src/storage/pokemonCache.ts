import AsyncStorage from '@react-native-async-storage/async-storage';

import { CACHE_TTL_MS } from '../constants/pokemon';
import { PokemonDetail, PokemonDetailBundle } from '../types/pokemon';

const LIST_CACHE_KEY = 'cache:pokemon:list:v1';
const DETAIL_CACHE_PREFIX = 'cache:pokemon:detail';

type PokemonListCache = {
  timestamp: number;
  items: PokemonDetail[];
  hasMore: boolean;
  nextOffset: number;
};

type PokemonDetailCache = {
  timestamp: number;
  bundle: PokemonDetailBundle;
};

const isCacheValid = (timestamp: number) => Date.now() - timestamp < CACHE_TTL_MS;

export const loadPokemonListCache = async (): Promise<PokemonListCache | null> => {
  try {
    const raw = await AsyncStorage.getItem(LIST_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: PokemonListCache = JSON.parse(raw);
    if (!isCacheValid(parsed.timestamp)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const savePokemonListCache = async (payload: Omit<PokemonListCache, 'timestamp'>) => {
  try {
    const record: PokemonListCache = {
      ...payload,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(LIST_CACHE_KEY, JSON.stringify(record));
  } catch (error: any) {
    // Handle storage full errors gracefully
    if (error?.message?.includes('SQLITE_FULL') || error?.message?.includes('database or disk is full')) {
      console.warn('Storage full when saving list cache, attempting cleanup...');
      try {
        await clearOldCacheEntries();
        // Retry once after cleanup
        const record: PokemonListCache = {
          ...payload,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(LIST_CACHE_KEY, JSON.stringify(record));
      } catch (retryError) {
        console.warn('Failed to save list cache after cleanup, continuing without cache:', retryError);
        // Don't throw - allow app to continue without caching
      }
    } else {
      console.warn('Failed to save list cache, continuing without cache:', error);
    }
  }
};

const buildDetailKey = (pokemonId: number) => `${DETAIL_CACHE_PREFIX}:${pokemonId}`;

export const loadPokemonDetailCache = async (
  pokemonId: number,
): Promise<PokemonDetailCache | null> => {
  try {
    const raw = await AsyncStorage.getItem(buildDetailKey(pokemonId));
    if (!raw) {
      return null;
    }

    const parsed: PokemonDetailCache = JSON.parse(raw);
    if (!isCacheValid(parsed.timestamp)) {
      return null;
    }

    return parsed;
  } catch (error: any) {
    // Handle storage errors gracefully
    if (error?.message?.includes('SQLITE_FULL') || error?.message?.includes('database or disk is full')) {
      console.warn('Storage full when loading cache, attempting cleanup...');
      try {
        await clearOldCacheEntries();
      } catch {
        // Ignore cleanup errors
      }
    }
    return null;
  }
};

export const savePokemonDetailCache = async (pokemonId: number, bundle: PokemonDetailBundle) => {
  try {
    const record: PokemonDetailCache = {
      timestamp: Date.now(),
      bundle,
    };

    await AsyncStorage.setItem(buildDetailKey(pokemonId), JSON.stringify(record));
  } catch (error: any) {
    // Handle storage full errors gracefully
    if (error?.message?.includes('SQLITE_FULL') || error?.message?.includes('database or disk is full')) {
      console.warn('Storage full, attempting to clear old cache entries...');
      try {
        await clearOldCacheEntries();
        // Retry once after cleanup
        const record: PokemonDetailCache = {
          timestamp: Date.now(),
          bundle,
        };
        await AsyncStorage.setItem(buildDetailKey(pokemonId), JSON.stringify(record));
      } catch (retryError) {
        console.warn('Failed to save cache after cleanup, continuing without cache:', retryError);
        // Don't throw - allow app to continue without caching
      }
    } else {
      // For other errors, log but don't throw to prevent app freeze
      console.warn('Failed to save cache, continuing without cache:', error);
    }
  }
};

/**
 * Clear old cache entries to free up space
 * Keeps only the most recent 50 detail caches
 */
const clearOldCacheEntries = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const detailKeys = allKeys.filter(key => key.startsWith(DETAIL_CACHE_PREFIX));
    
    if (detailKeys.length <= 50) {
      return; // No cleanup needed
    }

    // Load all cache entries with timestamps
    const entries = await Promise.all(
      detailKeys.map(async (key) => {
        try {
          const raw = await AsyncStorage.getItem(key);
          if (!raw) return null;
          const parsed: PokemonDetailCache = JSON.parse(raw);
          return { key, timestamp: parsed.timestamp };
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls and sort by timestamp (oldest first)
    const validEntries = entries.filter((e): e is { key: string; timestamp: number } => e !== null);
    validEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries, keeping only the 50 most recent
    const toRemove = validEntries.slice(0, validEntries.length - 50);
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove.map(e => e.key));
      console.log(`Cleared ${toRemove.length} old cache entries`);
    }
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
    throw error;
  }
};

/**
 * Clear all Pokémon cache entries
 * Useful for freeing up storage space
 */
export const clearAllPokemonCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(
      key => key.startsWith(DETAIL_CACHE_PREFIX) || key === LIST_CACHE_KEY
    );
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cache entries`);
    }
  } catch (error) {
    console.error('Error clearing all cache:', error);
    throw error;
  }
};

