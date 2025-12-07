import { Platform } from 'react-native';

// Try to import react-native-fs if available
let RNFS: any = null;
try {
  RNFS = require('react-native-fs');
} catch (e) {
  console.warn('react-native-fs not available - base64 upload will be skipped');
}

/**
 * Read file as base64 string
 * This is used to upload files from Android cache directory which Firebase Storage can't access directly
 */
/**
 * Check if a file exists at the given path
 */
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  if (!RNFS) {
    return false;
  }
  
  // Remove file:// prefix if present
  let cleanPath = filePath.replace(/^file:\/\//, '');
  
  try {
    return await RNFS.exists(cleanPath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

export const readFileAsBase64 = async (filePath: string): Promise<string> => {
  // Remove file:// prefix if present
  let cleanPath = filePath.replace(/^file:\/\//, '');
  
  // If react-native-fs is not available, throw error
  if (!RNFS) {
    throw new Error('react-native-fs is required for uploading files from cache directory. Please install it: npm install react-native-fs');
  }
  
  try {
    console.log('Reading file as base64 from path:', cleanPath);
    
    // Check if source file exists
    const exists = await RNFS.exists(cleanPath);
    if (!exists) {
      throw new Error(`File does not exist at path: ${cleanPath}`);
    }
    
    // Get file info to verify it's readable
    const fileInfo = await RNFS.stat(cleanPath);
    console.log('File info:', {
      path: cleanPath,
      size: fileInfo.size,
      isFile: fileInfo.isFile(),
    });
    
    if (fileInfo.size === 0) {
      throw new Error('File exists but is empty (0 bytes). The photo may not have been saved correctly.');
    }
    
    // Read file as base64
    const base64 = await RNFS.readFile(cleanPath, 'base64');
    
    if (!base64 || base64.length === 0) {
      throw new Error('File read returned empty data. The file may be corrupted.');
    }
    
    console.log('File read as base64 successfully, length:', base64.length);
    
    return base64;
  } catch (error: any) {
    console.error('Error reading file as base64:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      path: cleanPath,
    });
    
    // Provide more specific error messages
    if (error?.message?.includes('does not exist')) {
      throw new Error(`Photo file not found at: ${cleanPath}. Please try capturing again.`);
    } else if (error?.message?.includes('empty') || error?.message?.includes('0 bytes')) {
      throw new Error('Photo file is empty or corrupted. Please try capturing again.');
    } else if (error?.code === 'ENOENT') {
      throw new Error(`Photo file not found. Please try capturing again.`);
    } else if (error?.code === 'EACCES' || error?.message?.includes('permission')) {
      throw new Error('Permission denied accessing photo file. Please check app permissions.');
    }
    
    throw new Error(`Failed to read photo file: ${error?.message || 'Unknown error'}`);
  }
};

