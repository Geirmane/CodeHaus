import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { UserProfile } from '../types/user';

const usersCollection = firestore().collection('users');

const defaultProfile = (user: FirebaseAuthTypes.User, displayName?: string): UserProfile => ({
  uid: user.uid,
  email: user.email ?? '',
  displayName: displayName ?? user.displayName ?? user.email ?? 'Trainer',
  photoURL: user.photoURL,
  badges: [],
  points: 0,
  favoritesCount: 0,
  caughtCount: 0,
  createdAt: firestore.FieldValue.serverTimestamp() as unknown as UserProfile['createdAt'],
  updatedAt: firestore.FieldValue.serverTimestamp() as unknown as UserProfile['updatedAt'],
});

export type SignUpPayload = {
  email: string;
  password: string;
  displayName: string;
};

export const ensureUserProfileDocument = async (
  user: FirebaseAuthTypes.User,
  displayName?: string,
) => {
  if (!user.uid) {
    return;
  }

  const docRef = usersCollection.doc(user.uid);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    await docRef.set(defaultProfile(user, displayName));
  }
};

export const signUpWithEmail = async ({ email, password, displayName }: SignUpPayload) => {
  const credential = await auth().createUserWithEmailAndPassword(email.trim(), password);
  await credential.user.updateProfile({ displayName });
  await ensureUserProfileDocument(credential.user, displayName);
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await auth().signInWithEmailAndPassword(email.trim(), password);
  await ensureUserProfileDocument(credential.user);
  return credential.user;
};

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('Google Sign-In was cancelled or missing credentials.');
  }

  const googleCredential = auth.GoogleAuthProvider.credential(response.data.idToken);
  const credential = await auth().signInWithCredential(googleCredential);
  await ensureUserProfileDocument(credential.user);
  return credential.user;
};

export const signOutUser = () => auth().signOut();

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to update profile');
  }

  await usersCollection.doc(user.uid).update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Update user's display name in Firebase Auth and Firestore
 */
export const updateDisplayName = async (displayName: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to update display name');
  }

  await user.updateProfile({ displayName });
  await updateUserProfile({ displayName });
};

/**
 * Update user's email in Firebase Auth and Firestore
 */
export const updateEmail = async (newEmail: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to update email');
  }

  await user.updateEmail(newEmail.trim());
  await updateUserProfile({ email: newEmail.trim() });
};

/**
 * Update user's password
 */
export const updatePassword = async (newPassword: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to update password');
  }

  await user.updatePassword(newPassword);
};

/**
 * Update user's profile picture URL
 */
export const updateProfilePicture = async (photoURL: string) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User must be authenticated to update profile picture');
  }

  await user.updateProfile({ photoURL });
  await updateUserProfile({ photoURL });
};

