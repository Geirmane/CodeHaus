import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type CaughtPokemon = {
  pokemonId: number;
  pokemonName: string;
  caughtAt: FirebaseFirestoreTypes.Timestamp;
  userId: string;
};

const caughtPokemonCollection = (userId: string) =>
  firestore().collection('users').doc(userId).collection('caughtPokemon');

/**
 * Save a caught pokemon to Firestore
 * @param pokemonId - The ID of the caught pokemon
 * @param pokemonName - The name of the caught pokemon
 * @returns The saved caught pokemon document
 */
export const saveCaughtPokemon = async (
  pokemonId: number,
  pokemonName: string,
): Promise<CaughtPokemon> => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save caught pokemon');
  }

  // Check if already caught (to determine if we should increment count)
  const existingDoc = await caughtPokemonCollection(user.uid)
    .where('pokemonId', '==', pokemonId)
    .limit(1)
    .get();

  const isNewCatch = existingDoc.empty;

  // Always save a new caught pokemon entry (allow multiple captures)
  const caughtData = {
    pokemonId,
    pokemonName,
    caughtAt: firestore.FieldValue.serverTimestamp(),
    userId: user.uid,
  };

  const docRef = await caughtPokemonCollection(user.uid).add(caughtData);

  // Only increment caughtCount if this is a new pokemon species (not already in collection)
  if (isNewCatch) {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        caughtCount: firestore.FieldValue.increment(1),
      });
  }

  const savedData = await docRef.get();
  const data = savedData.data();
  return {
    pokemonId,
    pokemonName,
    caughtAt: (data?.caughtAt as FirebaseFirestoreTypes.Timestamp) || firestore.Timestamp.now(),
    userId: user.uid,
  } as CaughtPokemon;
};

/**
 * Get all caught pokemon IDs for the current user
 * @returns Set of caught pokemon IDs
 */
export const getCaughtPokemonIds = async (): Promise<Set<number>> => {
  const user = auth().currentUser;
  if (!user) {
    return new Set();
  }

  try {
    const snapshot = await caughtPokemonCollection(user.uid).get();
    const caughtIds = new Set<number>();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.pokemonId) {
        caughtIds.add(data.pokemonId);
      }
    });
    return caughtIds;
  } catch (error) {
    console.error('Error fetching caught pokemon:', error);
    return new Set();
  }
};

/**
 * Check if a specific pokemon is caught
 * @param pokemonId - The ID of the pokemon to check
 * @returns True if the pokemon is caught
 */
export const isPokemonCaught = async (pokemonId: number): Promise<boolean> => {
  const user = auth().currentUser;
  if (!user) {
    return false;
  }

  try {
    const snapshot = await caughtPokemonCollection(user.uid)
      .where('pokemonId', '==', pokemonId)
      .limit(1)
      .get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking caught pokemon:', error);
    return false;
  }
};

/**
 * Get all caught pokemon for the current user
 * @returns Array of caught pokemon, ordered by most recent first
 */
export const getAllCaughtPokemon = async (): Promise<CaughtPokemon[]> => {
  const user = auth().currentUser;
  if (!user) {
    return [];
  }

  try {
    const snapshot = await caughtPokemonCollection(user.uid)
      .orderBy('caughtAt', 'desc')
      .get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        pokemonId: data.pokemonId,
        pokemonName: data.pokemonName,
        caughtAt: data.caughtAt as FirebaseFirestoreTypes.Timestamp,
        userId: user.uid,
      } as CaughtPokemon;
    });
  } catch (error) {
    console.error('Error fetching caught pokemon:', error);
    return [];
  }
};
