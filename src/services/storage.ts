import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

/**
 * Upload an image file to Firebase Storage
 * @param filePath - Local file path (file://...)
 * @param folder - Folder path in storage (e.g., 'profile-pictures', 'captured-photos')
 * @param fileName - Optional custom file name, defaults to timestamp
 * @returns Download URL of uploaded image
 */
export const uploadImage = async (
  filePath: string,
  folder: string,
  fileName?: string,
): Promise<string> => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to upload images');
  }

  const timestamp = Date.now();
  const name = fileName || `image_${timestamp}.jpg`;
  const storagePath = `${folder}/${user.uid}/${name}`;

  const reference = storage().ref(storagePath);

  // Convert file:// URI to proper format for upload
  const normalizedPath = filePath.replace('file://', '');

  await reference.putFile(normalizedPath);
  const downloadURL = await reference.getDownloadURL();

  return downloadURL;
};

/**
 * Delete an image from Firebase Storage
 * @param downloadURL - The download URL of the image to delete
 */
export const deleteImage = async (downloadURL: string): Promise<void> => {
  try {
    const reference = storage().refFromURL(downloadURL);
    await reference.delete();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

