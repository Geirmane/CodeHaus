import { useCallback, useEffect, useState } from 'react';

import { fetchPokemonDetailBundle } from '../services/pokeApi';
import { loadPokemonDetailCache, savePokemonDetailCache } from '../storage/pokemonCache';
import { PokemonDetailBundle } from '../types/pokemon';

export const usePokemonDetail = (pokemonId: number) => {
  const [bundle, setBundle] = useState<PokemonDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(
    async (options?: { skipCache?: boolean }) => {
      setLoading(true);
      setError(null);
      let cacheServed = false;
      try {
        if (!options?.skipCache) {
          const cache = await loadPokemonDetailCache(pokemonId);
          if (cache) {
            setBundle(cache.bundle);
            cacheServed = true;
          }
        }

        const fresh = await fetchPokemonDetailBundle(pokemonId);
        setBundle(fresh);
        // Save cache in background, don't wait for it to avoid blocking
        savePokemonDetailCache(pokemonId, fresh).catch((err) => {
          console.warn('Background cache save failed:', err);
        });
      } catch (err) {
        if (!cacheServed) {
          setError(err instanceof Error ? err.message : 'Unable to load detail right now.');
        } else {
          setError('Showing cached data – pull to refresh to try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [pokemonId],
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return {
    bundle,
    loading,
    error,
    refresh: () => loadDetail({ skipCache: true }),
  };
};

