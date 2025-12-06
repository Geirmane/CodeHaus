import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  badges: string[];
  points: number;
  favoritesCount: number;
  caughtCount: number;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
};

export type SignUpFormValues = {
  displayName: string;
  email: string;
  password: string;
};

