import { PAGE_SIZE, POKE_API_URL } from '../constants/pokemon';
import {
  EvolutionChainLink,
  PokemonDetail,
  PokemonDetailBundle,
  PokemonListResponse,
  PokemonSpecies,
} from '../types/pokemon';
import { extractIdFromUrl, sanitizeFlavorText } from '../utils/pokemon';

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load data from ${url}`);
  }

  return (await response.json()) as T;
};

const pickEnglishFlavorText = (species: PokemonSpecies) => {
  const entry = species.flavor_text_entries.find(
    (item) => item.language.name === 'en',
  );

  if (!entry) {
    return 'No flavor data found for this Pokémon.';
  }

  return sanitizeFlavorText(entry.flavor_text);
};

const pickEnglishGenus = (species: PokemonSpecies) => {
  const entry = species.genera.find((item) => item.language.name === 'en');
  return entry?.genus ?? 'Pokémon';
};

const flattenEvolutionChain = (
  link: EvolutionChainLink,
  bucket: { name: string; id: number }[] = [],
) => {
  const id = extractIdFromUrl(link.species.url);
  if (id !== -1) {
    bucket.push({ name: link.species.name, id });
  }

  link.evolves_to.forEach((child) => flattenEvolutionChain(child, bucket));

  return bucket;
};

export const fetchPokemonBatch = async (offset: number, limit: number = PAGE_SIZE) => {
  const listData = await fetchJson<PokemonListResponse>(
    `${POKE_API_URL}/pokemon?offset=${offset}&limit=${limit}`,
  );

  const details = await Promise.all(
    listData.results.map((summary) => fetchJson<PokemonDetail>(summary.url)),
  );

  return {
    details,
    hasNext: Boolean(listData.next),
  };
};

export const fetchPokemonDetailBundle = async (pokemonId: number): Promise<PokemonDetailBundle> => {
  const detail = await fetchJson<PokemonDetail>(`${POKE_API_URL}/pokemon/${pokemonId}`);
  const species = await fetchJson<PokemonSpecies>(`${POKE_API_URL}/pokemon-species/${pokemonId}`);
  const evolutionChainResponse = await fetchJson<{ chain: EvolutionChainLink }>(
    species.evolution_chain.url,
  );

  return {
    detail,
    flavorText: pickEnglishFlavorText(species),
    genera: pickEnglishGenus(species),
    evolutions: flattenEvolutionChain(evolutionChainResponse.chain),
  };
};

