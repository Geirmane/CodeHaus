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

    // Ensure path starts with / for absolute path (unless it's already a Windows path like C:\)
    if (!normalizedPath.startsWith('/') && !normalizedPath.match(/^[A-Za-z]:/)) {
      normalizedPath = '/' + normalizedPath;
    }

    // Prepare upload path - ensure it's absolute and doesn't have file://
    let uploadPath = normalizedPath;
    if (uploadPath.includes('file://')) {
      uploadPath = uploadPath.replace(/^file:\/\//, '');
    }
    // Don't add leading / for Windows paths
    if (!uploadPath.startsWith('/') && !uploadPath.match(/^[A-Za-z]:/)) {
      uploadPath = '/' + uploadPath;
    }

    console.log('Uploading image:');
    console.log('  Platform:', Platform.OS);
    console.log('  Original path:', filePath);
    console.log('  Normalized path:', normalizedPath);
    console.log('  Final upload path:', uploadPath);
    console.log('  Storage path:', storagePath);
    
    // Verify file exists before attempting upload
    if (Platform.OS === 'android') {
      const { checkFileExists } = await import('../utils/fileHelper');
      const fileExists = await checkFileExists(uploadPath);
      console.log('  File exists check:', fileExists);
      if (!fileExists) {
        // Try the original path too
        const originalExists = await checkFileExists(filePath);
        console.log('  Original path exists check:', originalExists);
        if (originalExists) {
          uploadPath = filePath.replace(/^file:\/\//, '');
          console.log('  Using original path instead:', uploadPath);
        } else {
          throw new Error(`Photo file not found at path: ${uploadPath}. Please try capturing again.`);
        }
      }
    }
    
    // Try standard putFile first, fall back to base64 for Android cache files if it fails
    const isAndroidCacheFile = Platform.OS === 'android' && (
      uploadPath.includes('/cache/') || 
      uploadPath.includes('/data/user/')
    );
    
    // For Android cache files, try base64 upload method directly
    // For other files, try putFile first
    if (isAndroidCacheFile) {
      try {
        console.log('  Android file detected, using base64 upload method');
        console.log('  Reading file from path:', uploadPath);
        console.log('  Original file path:', filePath);
        
        // Read file as base64 (this will check if file exists internally)
        const base64Data = await readFileAsBase64(uploadPath);
        
        if (!base64Data || base64Data.length === 0) {
          throw new Error('File read as base64 but data is empty. The file may be corrupted or inaccessible.');
        }
        
        console.log('  Base64 data length:', base64Data.length);
        
        // Upload with base64 string using 'base64' format (not 'data_url')
        // react-native-firebase putString accepts 'raw' or 'base64' format
        const uploadTask = reference.putString(base64Data, 'base64', {
          contentType: 'image/jpeg',
        });
        
        // Wait for upload to complete and verify it succeeded
        const taskSnapshot = await uploadTask;
        
        // Verify upload completed successfully
        if (taskSnapshot.state !== 'success') {
          throw new Error(`Upload failed with state: ${taskSnapshot.state}`);
        }
        
        console.log('Upload successful using base64 method');
      } catch (base64Error: any) {
        console.error('Base64 upload error:', base64Error);
        console.error('Base64 error details:', {
          code: base64Error?.code,
          message: base64Error?.message,
          nativeError: base64Error?.nativeErrorCode,
          nativeMessage: base64Error?.nativeErrorMessage,
          stack: base64Error?.stack,
        });
        
        if (base64Error?.code === 'storage/unauthorized') {
          throw new Error('Permission denied. Please check your Firebase Storage security rules.');
        } else if (base64Error?.code === 'storage/quota-exceeded') {
          throw new Error('Storage quota exceeded. Please check your Firebase Storage plan.');
        } else if (base64Error?.code === 'storage/object-not-found') {
          // This error shouldn't occur during upload, but if it does, it's likely a file access issue
          throw new Error('Failed to access photo file. Please try capturing again.');
        } else if (base64Error?.code === 'storage/unknown' || base64Error?.message?.includes('bytes cannot be null')) {
          throw new Error(
            'Failed to read file data. The photo file may be corrupted or inaccessible. ' +
            'Please try capturing the photo again.'
          );
        }
        
        // Re-throw the original error if it's already a user-friendly message
        if (base64Error?.message && !base64Error?.message.includes('react-native-fs')) {
          throw base64Error;
        }
        
        throw new Error(
          `Failed to upload file: ${base64Error?.message || 'Unknown error'}. ` +
          `Please ensure react-native-fs is installed and try again.`
        );
      }
    } else {
      // For non-cache files, try the standard putFile method first
      try {
        console.log('  Attempting upload using putFile method');
        const uploadTask = reference.putFile(uploadPath);
        
        // Wait for upload to complete and verify it succeeded
        const taskSnapshot = await uploadTask;
        if (taskSnapshot.state !== 'success') {
          throw new Error(`Upload failed with state: ${taskSnapshot.state}`);
        }
        
        console.log('Upload successful using putFile method');
      } catch (uploadError: any) {
        // If putFile fails on Android and it's not a cache file, try base64 as fallback
        if (Platform.OS === 'android' && !isAndroidCacheFile) {
          console.log('  putFile failed, trying base64 fallback method');
          try {
            const base64Data = await readFileAsBase64(uploadPath);
            if (!base64Data || base64Data.length === 0) {
              throw new Error('File read as base64 but data is empty.');
            }
            const uploadTask = reference.putString(base64Data, 'base64', {
              contentType: 'image/jpeg',
            });
            
            // Wait for upload to complete and verify it succeeded
            const taskSnapshot = await uploadTask;
            if (taskSnapshot.state !== 'success') {
              throw new Error(`Upload failed with state: ${taskSnapshot.state}`);
            }
            
            console.log('Upload successful using base64 fallback method');
          } catch (fallbackError: any) {
            // If base64 also fails, throw the original putFile error
            throw uploadError;
          }
        } else {
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
          // This error typically means the file reference in Storage doesn't exist, but during upload it might mean file access issue
          throw new Error(`Failed to access photo file at path: ${uploadPath}. Please try capturing again.`);
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
    }
    
    // Wait a moment to ensure upload is fully processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get download URL with retry logic
    let downloadURL: string | null = null;
    let retries = 3;
    let lastError: any = null;
    
    while (retries > 0 && !downloadURL) {
      try {
        // First verify the file exists
        try {
          const metadata = await reference.getMetadata();
          console.log('File metadata verified:', {
            size: metadata.size,
            contentType: metadata.contentType,
            fullPath: metadata.fullPath,
          });
        } catch (metadataError: any) {
          console.error('Metadata check failed:', metadataError);
          if (metadataError?.code === 'storage/object-not-found') {
            // Wait a bit longer and retry
            if (retries > 1) {
              console.log(`File not found yet, waiting longer before retry (${retries} retries left)...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries--;
              continue;
            } else {
              throw new Error('Upload completed but file not found at reference. The upload may have failed. Please try again.');
            }
          }
          throw metadataError;
        }
        
        // Get download URL
        downloadURL = await reference.getDownloadURL();
        console.log('Download URL obtained successfully');
        break;
      } catch (urlError: any) {
        console.error(`Error getting download URL (${retries} retries left):`, urlError);
        lastError = urlError;
        
        if (urlError?.code === 'storage/object-not-found') {
          if (retries > 1) {
            // Wait longer before retrying
            console.log('Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
            continue;
          } else {
            throw new Error('Upload completed but file not found at reference. The upload may have failed. Please try again.');
          }
        }
        
        // For other errors, retry once more
        if (retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
          continue;
        } else {
          throw new Error(`Failed to get download URL: ${urlError?.message || 'Unknown error'}`);
        }
      }
    }
    
    if (!downloadURL) {
      throw new Error(`Failed to get download URL after retries: ${lastError?.message || 'Unknown error'}`);
    }
    
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

