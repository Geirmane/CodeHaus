import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import { readFileAsBase64 } from '../utils/fileHelper';

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

    // Prepare upload path - ensure it's absolute and doesn't have file://
    let uploadPath = normalizedPath;
    if (uploadPath.includes('file://')) {
      uploadPath = uploadPath.replace(/^file:\/\//, '');
    }
    if (!uploadPath.startsWith('/')) {
      uploadPath = '/' + uploadPath;
    }

    console.log('Uploading image:');
    console.log('  Platform:', Platform.OS);
    console.log('  Original path:', filePath);
    console.log('  Normalized path:', normalizedPath);
    console.log('  Final upload path:', uploadPath);
    console.log('  Storage path:', storagePath);
    
    // For Android cache files, use base64 upload method
    // This bypasses the file path access issue entirely
    if (Platform.OS === 'android' && uploadPath.includes('/cache/')) {
      try {
        console.log('  Android cache file detected, using base64 upload method');
        const base64Data = await readFileAsBase64(uploadPath);
        const base64String = `data:image/jpeg;base64,${base64Data}`;
        
        // Upload with base64 string
        // Note: putString returns a promise directly in react-native-firebase
        await reference.putString(base64String, 'data_url');
        console.log('Upload successful using base64 method');
      } catch (base64Error: any) {
        console.error('Base64 upload error:', base64Error);
        console.error('Base64 error details:', {
          code: base64Error?.code,
          message: base64Error?.message,
          nativeError: base64Error?.nativeErrorCode,
          nativeMessage: base64Error?.nativeErrorMessage,
        });
        
        if (base64Error?.code === 'storage/unauthorized') {
          throw new Error('Permission denied. Please check your Firebase Storage security rules.');
        } else if (base64Error?.code === 'storage/quota-exceeded') {
          throw new Error('Storage quota exceeded. Please check your Firebase Storage plan.');
        }
        
        throw new Error(
          `Failed to upload file from cache directory: ${base64Error?.message || 'Unknown error'}. ` +
          `Please ensure react-native-fs is installed and try again.`
        );
      }
    } else {
      // For non-cache files, use the standard putFile method
      try {
        await reference.putFile(uploadPath);
        console.log('Upload successful using putFile method');
      } catch (uploadError: any) {
        console.error('Upload error details:', {
          code: uploadError?.code,
          message: uploadError?.message,
          nativeError: uploadError?.nativeErrorCode,
          nativeMessage: uploadError?.nativeErrorMessage,
          path: uploadPath,
          originalPath: filePath,
        });
        
        // Handle specific error codes
        if (uploadError?.code === 'storage/object-not-found') {
          throw new Error(`File not accessible at path: ${uploadPath}. The photo file may have been moved or deleted. Please try capturing again.`);
        } else if (uploadError?.code === 'storage/unauthorized') {
          throw new Error('Permission denied. Please check your Firebase Storage security rules.');
        } else if (uploadError?.code === 'storage/canceled') {
          throw new Error('Upload was canceled');
        } else if (uploadError?.nativeErrorCode === 'file-not-found' || 
                   uploadError?.message?.includes('ENOENT') || 
                   uploadError?.message?.includes('No such file') ||
                   uploadError?.nativeErrorMessage?.includes('No such file') ||
                   uploadError?.nativeErrorMessage?.includes('ENOENT')) {
          throw new Error(`File not found at path: ${uploadPath}. Please try capturing the photo again.`);
        } else if (uploadError?.nativeErrorCode === 'permission-denied' ||
                   uploadError?.message?.toLowerCase().includes('permission') ||
                   uploadError?.nativeErrorMessage?.toLowerCase().includes('permission')) {
          throw new Error('Permission denied accessing the photo file. Please check app permissions in device settings.');
        }
        
        // Re-throw with more context
        const errorMessage = uploadError?.message || uploadError?.nativeErrorMessage || 'Unknown upload error';
        throw new Error(`Upload failed: ${errorMessage}. Path: ${uploadPath}`);
      }
    }
    
    // Wait a moment to ensure upload is fully processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get download URL
    try {
      const downloadURL = await reference.getDownloadURL();
      console.log('Download URL obtained successfully');
      return downloadURL;
    } catch (urlError: any) {
      console.error('Error getting download URL:', urlError);
      // Check if file exists first
      try {
        await reference.getMetadata();
        // File exists, retry getting URL
        const downloadURL = await reference.getDownloadURL();
        return downloadURL;
      } catch (metadataError: any) {
        if (metadataError?.code === 'storage/object-not-found') {
          throw new Error('Upload completed but file not found at reference. Please try again.');
        }
        throw new Error(`Failed to get download URL: ${urlError?.message || 'Unknown error'}`);
      }
    }
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

