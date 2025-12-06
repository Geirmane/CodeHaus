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
  const record: PokemonListCache = {
    ...payload,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(LIST_CACHE_KEY, JSON.stringify(record));
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
  } catch {
    return null;
  }
};

export const savePokemonDetailCache = async (pokemonId: number, bundle: PokemonDetailBundle) => {
  const record: PokemonDetailCache = {
    timestamp: Date.now(),
    bundle,
  };

  await AsyncStorage.setItem(buildDetailKey(pokemonId), JSON.stringify(record));
};

