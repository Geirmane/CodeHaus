import { Share, Platform, Linking, Alert } from 'react-native';

export type ShareOptions = {
  url: string;
  title?: string;
  message?: string;
  pokemonName?: string;
};

/**
 * Share a captured Pokémon photo to social media
 * @param options - Share options including image URL, title, message, and Pokémon name
 */
export const sharePhoto = async (options: ShareOptions): Promise<void> => {
  const { url, title, message, pokemonName } = options;
  
  const shareMessage = message || 
    (pokemonName 
      ? `I just captured ${pokemonName} with AR! 🎮✨` 
      : 'Check out my AR Pokémon capture! 🎮✨');
  
  const shareTitle = title || 'Share Pokémon Photo';

  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Use React Native's built-in Share API
      const result = await Share.share({
        message: `${shareMessage}\n${url}`,
        title: shareTitle,
        url: Platform.OS === 'ios' ? url : undefined, // iOS uses url, Android uses message
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // User selected a specific app
          console.log('Shared via:', result.activityType);
        } else {
          // Shared successfully
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share sheet
        console.log('Share dismissed');
      }
    } else {
      // Fallback for web or other platforms
      Alert.alert('Share', `Share this: ${shareMessage}\n${url}`);
    }
  } catch (error: any) {
    console.error('Error sharing photo:', error);
    Alert.alert('Error', 'Failed to share photo. Please try again.');
  }
};

/**
 * Open a specific social media app to share
 * @param platform - Social media platform ('facebook', 'twitter', 'instagram', 'google')
 * @param options - Share options
 */
export const shareToSocialMedia = async (
  platform: 'facebook' | 'twitter' | 'instagram' | 'google',
  options: ShareOptions,
): Promise<void> => {
  const { url, pokemonName } = options;
  
  const shareMessage = pokemonName 
    ? `I just captured ${pokemonName} with AR! 🎮✨` 
    : 'Check out my AR Pokémon capture! 🎮✨';

  let shareUrl = '';
  
  try {
    switch (platform) {
      case 'facebook':
        // Facebook sharing via URL scheme or web
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        // Twitter/X sharing
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, but we can try to open the app
        // Note: Instagram requires the image to be saved to device first
        Alert.alert(
          'Instagram Share',
          'To share on Instagram, please save the image to your device first, then open Instagram and share from your gallery.',
          [{ text: 'OK' }],
        );
        return;
      case 'google':
        // Google+ is deprecated, but we can use Google Photos or general share
        shareUrl = `https://photos.google.com/`;
        Alert.alert(
          'Google Share',
          'Please use the general share option and select Google Photos or another Google app.',
          [{ text: 'OK' }],
        );
        return;
      default:
        throw new Error('Unsupported platform');
    }

    const canOpen = await Linking.canOpenURL(shareUrl);
    if (canOpen) {
      await Linking.openURL(shareUrl);
    } else {
      // Fallback to general share
      await sharePhoto(options);
    }
  } catch (error: any) {
    console.error(`Error sharing to ${platform}:`, error);
    // Fallback to general share
    await sharePhoto(options);
  }
};

/**
 * Show share options with social media buttons
 * @param options - Share options
 */
export const showShareOptions = (options: ShareOptions): void => {
  Alert.alert(
    'Share Photo',
    'Choose how to share your Pokémon capture:',
    [
      {
        text: 'Facebook',
        onPress: () => shareToSocialMedia('facebook', options),
      },
      {
        text: 'Twitter/X',
        onPress: () => shareToSocialMedia('twitter', options),
      },
      {
        text: 'Instagram',
        onPress: () => shareToSocialMedia('instagram', options),
      },
      {
        text: 'More Options',
        onPress: () => sharePhoto(options),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true },
  );
};

