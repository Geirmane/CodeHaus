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
export const readFileAsBase64 = async (filePath: string): Promise<string> => {
  // Remove file:// prefix if present
  let cleanPath = filePath.replace(/^file:\/\//, '');
  
  // If react-native-fs is not available, throw error
  if (!RNFS) {
    throw new Error('react-native-fs is required for uploading files from cache directory. Please install it: npm install react-native-fs');
  }
  
  try {
    // Check if source file exists
    const exists = await RNFS.exists(cleanPath);
    if (!exists) {
      throw new Error(`File does not exist at path: ${cleanPath}`);
    }
    
    // Read file as base64
    const base64 = await RNFS.readFile(cleanPath, 'base64');
    console.log('File read as base64, length:', base64.length);
    
    return base64;
  } catch (error: any) {
    console.error('Error reading file as base64:', error);
    throw new Error(`Failed to read file: ${error?.message || 'Unknown error'}`);
  }
};

