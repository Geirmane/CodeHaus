import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {
  SignUpPayload,
  ensureUserProfileDocument,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from '../services/auth';
import { UserProfile } from '../types/user';

type AuthContextValue = {
  user: FirebaseAuthTypes.User | null;
  profile: UserProfile | null;
  initializing: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let isMounted = true;
    setProfileLoading(true);

    const init = async () => {
      await ensureUserProfileDocument(user);
      if (!isMounted) {
        return;
      }
      return firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot((snapshot) => {
          const exists =
            typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists;
          const data = snapshot.data() as UserProfile | undefined;
          setProfile(exists && data ? { ...data, uid: user.uid } : null);
          setProfileLoading(false);
        });
    };

    let unsubscribe: (() => void) | undefined;
    init()
      .then((unsub) => {
        unsubscribe = unsub ?? undefined;
      })
      .catch(() => {
        setProfileLoading(false);
      });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      await signInWithEmail(email, password);
    },
    [],
  );

  const handleSignUp = useCallback(
    async (payload: SignUpPayload) => {
      await signUpWithEmail(payload);
    },
    [],
  );

  const handleGoogleSignIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      initializing,
      profileLoading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signInWithGoogle: handleGoogleSignIn,
      signOut: handleSignOut,
    }),
    [
      user,
      profile,
      initializing,
      profileLoading,
      handleSignIn,
      handleSignUp,
      handleGoogleSignIn,
      handleSignOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

