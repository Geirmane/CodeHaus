import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export type CapturedPhoto = {
  id: string;
  photoURL: string; // Can be local file path (file://) or remote URL
  localPath?: string; // Local file path for local storage
  pokemonId?: number | null;
  pokemonName?: string | null;
  capturedAt: FirebaseFirestoreTypes.Timestamp;
  userId: string;
};

const photosCollection = (userId: string) =>
  firestore().collection('users').doc(userId).collection('capturedPhotos');

/**
 * Save a captured photo locally and store metadata in Firestore
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

  try {
    // Remove file:// prefix if present for file operations
    let cleanPath = photoPath.replace(/^file:\/\//, '');
    
    // Verify file exists
    const fileExists = await RNFS.exists(cleanPath);
    if (!fileExists) {
      throw new Error(`Photo file not found at path: ${cleanPath}`);
    }

    // Get file info
    const fileInfo = await RNFS.stat(cleanPath);
    if (fileInfo.size === 0) {
      throw new Error('Photo file is empty');
    }

    // Create a permanent directory for captured photos if it doesn't exist
    const photosDir = Platform.OS === 'android' 
      ? `${RNFS.PicturesDirectoryPath}/CapturedPokemon`
      : `${RNFS.DocumentDirectoryPath}/CapturedPokemon`;
    
    const dirExists = await RNFS.exists(photosDir);
    if (!dirExists) {
      await RNFS.mkdir(photosDir);
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `pokemon_${user.uid}_${timestamp}.jpg`;
    const permanentPath = `${photosDir}/${fileName}`;

    // Copy file to permanent location
    await RNFS.copyFile(cleanPath, permanentPath);

    // Verify the copy was successful
    const copyExists = await RNFS.exists(permanentPath);
    if (!copyExists) {
      throw new Error('Failed to save photo to permanent location');
    }

    // Create file:// URI for display
    const fileUri = `file://${permanentPath}`;

    // Save metadata to Firestore with local file path
    const photoData = {
      photoURL: fileUri, // Use local file path
      localPath: permanentPath, // Store absolute path for reference
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
      photoURL: fileUri,
      localPath: permanentPath,
      pokemonId: pokemonId || null,
      pokemonName: pokemonName || null,
      capturedAt: (data?.capturedAt as FirebaseFirestoreTypes.Timestamp) || firestore.Timestamp.now(),
      userId: user.uid,
    } as CapturedPhoto;
  } catch (error: any) {
    console.error('Error saving captured photo:', error);
    throw new Error(`Failed to save photo: ${error?.message || 'Unknown error'}`);
  }
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
 * @param photoURL - Local file path or URL of the photo to delete
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

  // Delete local file if it exists
  try {
    // Remove file:// prefix if present
    let filePath = photoURL.replace(/^file:\/\//, '');
    
    // Check if file exists and delete it
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
      console.log('Local photo file deleted:', filePath);
    }
  } catch (error) {
    console.error('Error deleting local photo file:', error);
    // Continue even if file deletion fails
  }
};

