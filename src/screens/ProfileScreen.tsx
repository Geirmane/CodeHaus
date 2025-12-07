import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../../AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import {
  updateDisplayName,
  updateEmail,
  updatePassword,
  updateProfilePicture,
} from '../services/auth';
import { uploadImage } from '../services/storage';
// Image picker will be imported dynamically if available
let ImagePicker: any = null;
try {
  ImagePicker = require('react-native-image-picker');
} catch (e) {
  console.warn('react-native-image-picker not available');
}

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export const ProfileScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setProfilePhoto(user.photoURL || null);
    }
  }, [user]);

  const handlePickImage = () => {
    if (!ImagePicker) {
      Alert.alert(
        'Image Picker Not Available',
        'Please install react-native-image-picker to change profile pictures.\n\nRun: npm install react-native-image-picker',
      );
      return;
    }

    const options: any = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    ImagePicker.launchImageLibrary(options, async (response: any) => {
      if (response.didCancel || !response.assets?.[0]) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      const asset = response.assets[0];
      if (!asset.uri) {
        return;
      }

      try {
        setUploadingPhoto(true);
        const photoURL = await uploadImage(asset.uri, 'profile-pictures', `profile_${user?.uid}.jpg`);
        await updateProfilePicture(photoURL);
        setProfilePhoto(photoURL);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (error: any) {
        console.error('Error uploading profile picture:', error);
        Alert.alert('Error', error.message || 'Failed to update profile picture');
      } finally {
        setUploadingPhoto(false);
      }
    });
  };

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await updateDisplayName(displayName.trim());
      Alert.alert('Success', 'Display name updated!');
    } catch (error: any) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', error.message || 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Alert.alert(
      'Update Email',
      'Are you sure you want to update your email address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setLoading(true);
              await updateEmail(email.trim());
              Alert.alert('Success', 'Email updated! Please check your new email for verification.');
            } catch (error: any) {
              console.error('Error updating email:', error);
              Alert.alert('Error', error.message || 'Failed to update email');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Re-authenticate user before password change
    try {
      setLoading(true);
      const auth = require('@react-native-firebase/auth').default();
      const credential = require('@react-native-firebase/auth').EmailAuthProvider.credential(
        user?.email || '',
        currentPassword,
      );
      await user?.reauthenticateWithCredential(credential);
      await updatePassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated!');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else {
        Alert.alert('Error', error.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Profile Picture Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Picture</Text>
          <View style={styles.profilePictureContainer}>
            <View style={[styles.profilePictureWrapper, { borderColor: colors.primary }]}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePicture} />
              ) : (
                <View style={[styles.profilePicturePlaceholder, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.profilePicturePlaceholderText, { color: colors.primary }]}>
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
              onPress={handlePickImage}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.changePhotoButtonText}>Change Photo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Name Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleUpdateDisplayName}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Email Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleUpdateEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Update Email</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  profilePictureContainer: {
    alignItems: 'center',
    gap: 16,
  },
  profilePictureWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicturePlaceholderText: {
    fontSize: 48,
    fontWeight: '900',
  },
  changePhotoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  changePhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

