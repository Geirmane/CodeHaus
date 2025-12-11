import { useEffect, useState, useCallback } from 'react';
import { getCaughtPokemonIds, saveCaughtPokemon } from '../services/caughtPokemon';
import { useAuth } from '../../AuthContext';

/**
 * Hook to manage caught pokemon state
 * @returns Object with caught pokemon IDs set and functions to check/save caught status
 */
export const useCaughtPokemon = () => {
  const { user } = useAuth();
  const [caughtIds, setCaughtIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadCaughtPokemon = useCallback(async () => {
    if (!user) {
      setCaughtIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ids = await getCaughtPokemonIds();
      setCaughtIds(ids);
    } catch (error) {
      console.error('Error loading caught pokemon:', error);
      setCaughtIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCaughtPokemon();
  }, [loadCaughtPokemon]);

  const isCaught = useCallback(
    (pokemonId: number): boolean => {
      return caughtIds.has(pokemonId);
    },
    [caughtIds],
  );

  const catchPokemon = useCallback(
    async (pokemonId: number, pokemonName: string) => {
      if (!user) {
        throw new Error('User must be authenticated to catch pokemon');
      }

      try {
        await saveCaughtPokemon(pokemonId, pokemonName);
        // Update local state
        setCaughtIds((prev) => new Set([...prev, pokemonId]));
      } catch (error) {
        console.error('Error catching pokemon:', error);
        throw error;
      }
    },
    [user],
  );

  return {
    caughtIds,
    isCaught,
    catchPokemon,
    loading,
    refresh: loadCaughtPokemon,
  };
};

