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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen = ({ navigation }: Props) => {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!displayName || !email || !password) {
      setError('Fill in all fields to continue.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signUp({ displayName, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start building your personal Pokédex.</Text>

        <TextInput
          style={styles.input}
          placeholder="Trainer name"
          value={displayName}
          onChangeText={setDisplayName}
        />
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
          textContentType="newPassword"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignIn')}
          disabled={submitting}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? <Text style={styles.linkText}>Sign in</Text>
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
});

