import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { uploadImage } from './storage';

export type CapturedPhoto = {
  id: string;
  photoURL: string;
  pokemonId?: number | null;
  pokemonName?: string | null;
  capturedAt: FirebaseFirestoreTypes.Timestamp;
  userId: string;
};

const photosCollection = (userId: string) =>
  firestore().collection('users').doc(userId).collection('capturedPhotos');

/**
 * Save a captured photo to Firestore
 * @param photoPath - Local file path of the photo
 * @param pokemonId - Optional Pokémon ID if photo contains a Pokémon
 * @param pokemonName - Optional Pokémon name
 * @returns The saved photo document
 */
export const saveCapturedPhoto = async (
  photoPath: string,
  pokemonId?: number,
  pokemonName?: string,
): Promise<CapturedPhoto> => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to save photos');
  }

  // Upload photo to Firebase Storage
  const downloadURL = await uploadImage(photoPath, 'captured-photos');

  // Save metadata to Firestore
  const photoData = {
    photoURL: downloadURL,
    pokemonId: pokemonId || null,
    pokemonName: pokemonName || null,
    capturedAt: firestore.FieldValue.serverTimestamp(),
    userId: user.uid,
  };

  const docRef = await photosCollection(user.uid).add(photoData);

  const savedData = await docRef.get();
  const data = savedData.data();
  return {
    id: docRef.id,
    photoURL: downloadURL,
    pokemonId: pokemonId || null,
    pokemonName: pokemonName || null,
    capturedAt: (data?.capturedAt as FirebaseFirestoreTypes.Timestamp) || firestore.Timestamp.now(),
    userId: user.uid,
  } as CapturedPhoto;
};

/**
 * Get all captured photos for the current user
 * @returns Array of captured photos, ordered by most recent first
 */
export const getCapturedPhotos = async (): Promise<CapturedPhoto[]> => {
  const user = auth().currentUser;
  if (!user) {
    return [];
  }

  const snapshot = await photosCollection(user.uid)
    .orderBy('capturedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CapturedPhoto[];
};

/**
 * Subscribe to captured photos for real-time updates
 * @param callback - Function called with array of photos when data changes
 * @returns Unsubscribe function
 */
export const subscribeToCapturedPhotos = (
  callback: (photos: CapturedPhoto[]) => void,
): (() => void) => {
  const user = auth().currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  return photosCollection(user.uid)
    .orderBy('capturedAt', 'desc')
    .onSnapshot((snapshot) => {
      const photos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CapturedPhoto[];
      callback(photos);
    });
};

/**
 * Delete a captured photo
 * @param photoId - ID of the photo document to delete
 * @param photoURL - Download URL of the photo to delete from storage
 */
export const deleteCapturedPhoto = async (
  photoId: string,
  photoURL: string,
): Promise<void> => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to delete photos');
  }

  // Delete from Firestore
  await photosCollection(user.uid).doc(photoId).delete();

  // Delete from Storage
  try {
    const { deleteImage } = await import('./storage');
    await deleteImage(photoURL);
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    // Continue even if storage deletion fails
  }
};

