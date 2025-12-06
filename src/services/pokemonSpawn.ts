import { Location, detectBiome, getBiomePokemonTypes, Biome } from './geolocation';
import { PokemonDetail } from '../types/pokemon';
import { POKE_API_URL } from '../constants/pokemon';

export type SpawnedPokemon = {
  pokemon: PokemonDetail;
  location: Location;
  spawnTime: number;
  id: string;
};

const SPAWN_RADIUS_METERS = 100; // 100 meter radius
const SPAWN_COOLDOWN_MS = 30000; // 30 seconds between spawns
const MAX_SPAWNS = 10; // Maximum spawned Pokémon at once

// Cache of spawned Pokémon
let spawnedPokemon: SpawnedPokemon[] = [];
let lastSpawnTime = 0;

// Fetch a random Pokémon by type
const fetchRandomPokemonByType = async (type: string): Promise<PokemonDetail | null> => {
  try {
    // First, get all Pokémon of this type
    const typeResponse = await fetch(`${POKE_API_URL}/type/${type}`);
    if (!typeResponse.ok) {
      return null;
    }

    const typeData = await typeResponse.json();
    const pokemonList = typeData.pokemon;

    if (!pokemonList || pokemonList.length === 0) {
      return null;
    }

    // Pick a random Pokémon from the list
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];

    // Fetch full details
    const pokemonResponse = await fetch(randomPokemon.pokemon.url);
    if (!pokemonResponse.ok) {
      return null;
    }

    return await pokemonResponse.json();
  } catch (error) {
    console.warn('Error fetching random Pokémon:', error);
    return null;
  }
};

// Generate a random offset from the user's location
const generateRandomOffset = (radiusMeters: number): { lat: number; lng: number } => {
  // Convert meters to degrees (approximate)
  const radiusDegrees = radiusMeters / 111000; // 1 degree ≈ 111km

  // Random angle
  const angle = Math.random() * 2 * Math.PI;

  // Random distance within radius
  const distance = Math.random() * radiusDegrees;

  return {
    lat: Math.cos(angle) * distance,
    lng: Math.sin(angle) * distance,
  };
};

export const spawnPokemonNearby = async (
  userLocation: Location,
): Promise<SpawnedPokemon | null> => {
  const now = Date.now();

  // Check cooldown
  if (now - lastSpawnTime < SPAWN_COOLDOWN_MS) {
    return null;
  }

  // Clean up old spawns (older than 5 minutes)
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  spawnedPokemon = spawnedPokemon.filter((spawn) => spawn.spawnTime > fiveMinutesAgo);

  // Check max spawns
  if (spawnedPokemon.length >= MAX_SPAWNS) {
    return null;
  }

  // Detect biome and get appropriate types
  const biome = detectBiome(userLocation);
  const availableTypes = getBiomePokemonTypes(biome);

  // Pick a random type
  const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

  // Fetch a random Pokémon of that type
  const pokemon = await fetchRandomPokemonByType(randomType);

  if (!pokemon) {
    return null;
  }

  // Generate spawn location near user
  const offset = generateRandomOffset(SPAWN_RADIUS_METERS);
  const spawnLocation: Location = {
    latitude: userLocation.latitude + offset.lat,
    longitude: userLocation.longitude + offset.lng,
  };

  const spawned: SpawnedPokemon = {
    pokemon,
    location: spawnLocation,
    spawnTime: now,
    id: `${pokemon.id}-${now}`,
  };

  spawnedPokemon.push(spawned);
  lastSpawnTime = now;

  return spawned;
};

export const getNearbySpawns = (userLocation: Location, radiusMeters: number = 200): SpawnedPokemon[] => {
  return spawnedPokemon.filter((spawn) => {
    const distance = calculateDistance(userLocation, spawn.location);
    return distance <= radiusMeters;
  });
};

export const removeSpawn = (spawnId: string): void => {
  spawnedPokemon = spawnedPokemon.filter((spawn) => spawn.id !== spawnId);
};

export const clearAllSpawns = (): void => {
  spawnedPokemon = [];
  lastSpawnTime = 0;
};

// Calculate distance between two locations in meters (Haversine formula)
const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

