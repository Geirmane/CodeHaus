import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

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

  if (!filePath || !filePath.trim()) {
    throw new Error('Invalid file path provided');
  }

  try {
    const timestamp = Date.now();
    const name = fileName || `image_${timestamp}.jpg`;
    const storagePath = `${folder}/${user.uid}/${name}`;

    const reference = storage().ref(storagePath);

    // Convert file:// URI to proper format for upload
    // react-native-vision-camera returns absolute paths like /storage/emulated/0/... or /var/mobile/...
    let normalizedPath = filePath.trim();
    
    // Remove file:// prefix if present (needed for Image component but not for Firebase Storage)
    if (normalizedPath.startsWith('file:///')) {
      // Android/iOS: file:///path/to/file
      normalizedPath = normalizedPath.substring(7); // Remove 'file://'
    } else if (normalizedPath.startsWith('file://')) {
      // Some formats: file://path/to/file
      normalizedPath = normalizedPath.substring(6); // Remove 'file:'
      // Ensure it starts with / for absolute path
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
      }
    }
    
    // Ensure we have a valid absolute path
    if (!normalizedPath || normalizedPath.length === 0) {
      throw new Error('Invalid file path: path is empty after normalization');
    }

    // Ensure path starts with / for absolute path
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }

    console.log('Uploading image:');
    console.log('  Platform:', Platform.OS);
    console.log('  Original path:', filePath);
    console.log('  Normalized path:', normalizedPath);
    console.log('  Storage path:', storagePath);
    
    try {
      // For Android, putFile expects the file path directly
      // For iOS, it also expects the file path
      // The path should be absolute and not include file://
      await reference.putFile(normalizedPath);
      console.log('Upload successful');
    } catch (uploadError: any) {
      console.error('Upload error details:', {
        code: uploadError?.code,
        message: uploadError?.message,
        nativeError: uploadError?.nativeErrorCode,
        path: normalizedPath,
        originalPath: filePath,
      });
      
      // Handle specific error codes
      if (uploadError?.code === 'storage/object-not-found') {
        // This is unusual for upload - might be a permissions or path issue
        throw new Error(`Upload failed: File path may be incorrect or permissions denied. Path: ${normalizedPath}`);
      } else if (uploadError?.code === 'storage/unauthorized') {
        throw new Error('Permission denied. Please check your Firebase Storage security rules.');
      } else if (uploadError?.code === 'storage/canceled') {
        throw new Error('Upload was canceled');
      } else if (uploadError?.message?.includes('ENOENT') || uploadError?.message?.includes('No such file')) {
        throw new Error(`File not found at path: ${normalizedPath}. Please try capturing the photo again.`);
      }
      
      // Re-throw with original error for other cases
      throw uploadError;
    }
    const downloadURL = await reference.getDownloadURL();

    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    if (error?.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check your Firebase Storage rules.');
    } else if (error?.code === 'storage/canceled') {
      throw new Error('Upload was canceled');
    } else if (error?.code === 'storage/unknown') {
      throw new Error('Unknown error occurred during upload');
    }
    throw new Error(error?.message || 'Failed to upload image');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param downloadURL - The download URL of the image to delete
 */
export const deleteImage = async (downloadURL: string): Promise<void> => {
  try {
    if (!downloadURL || !downloadURL.trim()) {
      console.warn('Invalid download URL provided for deletion');
      return;
    }

    const reference = storage().refFromURL(downloadURL);
    
    // Check if the file exists before trying to delete
    try {
      await reference.getMetadata();
    } catch (metadataError: any) {
      // If file doesn't exist, that's okay - it's already deleted
      if (metadataError?.code === 'storage/object-not-found') {
        console.log('Image already deleted or does not exist');
        return;
      }
      throw metadataError;
    }
    
    await reference.delete();
  } catch (error: any) {
    // Handle object-not-found error gracefully
    if (error?.code === 'storage/object-not-found') {
      console.log('Image already deleted or does not exist');
      return;
    }
    console.error('Error deleting image:', error);
    // Don't throw - allow the operation to continue even if storage deletion fails
    // This is important because the Firestore record might already be deleted
  }
};

