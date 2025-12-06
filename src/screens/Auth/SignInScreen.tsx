import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export const SignInScreen = ({ navigation }: Props) => {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue with Google right now.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to access your Pokédex progress.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignIn}
          disabled={submitting || googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#1b1b1f" />
          ) : (
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}
          disabled={submitting}
        >
          <Text style={styles.secondaryButtonText}>
            New here? <Text style={styles.linkText}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7fb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b1b1f',
  },
  subtitle: {
    color: '#4a4a4f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#b00020',
  },
  primaryButton: {
    backgroundColor: '#ef5350',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4a4a4f',
  },
  linkText: {
    color: '#ef5350',
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ececf2',
  },
  dividerText: {
    color: '#7b7b85',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#d0d0d8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  socialButtonText: {
    fontWeight: '600',
    color: '#1b1b1f',
  },
});

