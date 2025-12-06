import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

type SignupScreenProps = {
  onNavigateToLogin: () => void;
};

type StarterPokemon = {
  id: number;
  name: string;
  sprite: string;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStarter, setSelectedStarter] = useState<number | null>(null);
  const [starters, setStarters] = useState<StarterPokemon[]>([]);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [starterError, setStarterError] = useState<string>('');
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fetch starter Pokemon from PokeAPI (Bulbasaur, Charmander, Squirtle)
    const fetchStarters = async () => {
      const starterIds = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
      const promises = starterIds.map(async (id) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await response.json();
          return {
            id: data.id,
            name: data.name,
            sprite: data.sprites.front_default,
          };
        } catch (error) {
          console.error('Error fetching starter:', error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      setStarters(results.filter((s): s is StarterPokemon => s !== null));
    };

    fetchStarters();
  }, []);

  useEffect(() => {
    // Validate email in real-time
    if (email) {
      const errors: string[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email.includes('@')) {
        errors.push('Missing @ symbol');
      } else {
        const parts = email.split('@');
        if (parts[0].length === 0) {
          errors.push('Missing username');
        }
        if (parts[1] && !parts[1].includes('.')) {
          errors.push('Invalid domain');
        }
      }
      
      if (!emailRegex.test(email)) {
        if (!errors.includes('Missing @ symbol') && 
            !errors.includes('Missing username') && 
            !errors.includes('Invalid domain')) {
          errors.push('Invalid email format');
        }
      }
      
      setEmailErrors(errors);
    } else {
      setEmailErrors([]);
    }
  }, [email]);

  useEffect(() => {
    // Validate password in real-time
    if (password) {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('At least 8 characters');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('1 digit');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('1 uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('1 lowercase letter');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('1 symbol (e.g. !, @, &)');
      }
      
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  useEffect(() => {
    // Validate confirm password in real-time
    if (confirmPassword && password) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSignup = async () => {
    // Reset starter error
    setStarterError('');

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (emailErrors.length > 0) {
      Alert.alert('Invalid Email', 'Please fix the email errors before continuing');
      return;
    }

    if (passwordErrors.length > 0) {
      Alert.alert('Weak Password', 'Please fix the password requirements before continuing');
      return;
    }

    if (confirmPasswordError) {
      return; // Error is already displayed below the field
    }

    if (!selectedStarter) {
      setStarterError('Please choose your starter Pokémon to begin your journey!');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Welcome, Trainer! Your journey begins now!');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Begin Your Journey!</Text>
          <Text style={styles.subtitle}>Create your Trainer Account</Text>
        </View>

        {/* Starter Selection */}
        <View style={styles.starterSection}>
          <Text style={styles.sectionTitle}>Choose Your Starter Pokémon</Text>
          <View style={styles.starterContainer}>
            {starters.map((starter) => (
              <TouchableOpacity
                key={starter.id}
                style={[
                  styles.starterCard,
                  selectedStarter === starter.id && styles.selectedStarter,
                  starterError && !selectedStarter && styles.starterCardError,
                ]}
                onPress={() => {
                  setSelectedStarter(starter.id);
                  setStarterError(''); // Clear error when a starter is selected
                }}
                disabled={isLoading}
              >
                <Image
                  source={{ uri: starter.sprite }}
                  style={styles.starterImage}
                  resizeMode="contain"
                />
                <Text style={styles.starterName}>
                  {starter.name.charAt(0).toUpperCase() + starter.name.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {starterError && (
            <View style={styles.starterErrorContainer}>
              <Text style={styles.starterErrorText}>⚠️ {starterError}</Text>
            </View>
          )}
        </View>

        {/* Signup Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailErrors.length > 0 && styles.inputError]}
              placeholder="trainer@pokemon.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {emailErrors.length > 0 && (
              <View style={styles.errorContainer}>
                {emailErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>• {error}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordErrors.length > 0 && styles.inputError]}
              placeholder="Strong password required"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
            {passwordErrors.length > 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Password must include:</Text>
                {passwordErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>• {error}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, confirmPasswordError && styles.inputError]}
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />
            {confirmPasswordError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>• {confirmPasswordError}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>
              {isLoading ? 'Creating Account...' : 'Start Adventure'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already a Trainer? </Text>
            <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Your adventure awaits! 🎮</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 26,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FF6B9D',
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 107, 157, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 17,
    color: '#FF6B9D',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  starterSection: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B9D',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.8,
  },
  starterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  starterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    width: 110,
    borderWidth: 3,
    borderColor: '#FFE5ED',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  starterCardError: {
    borderColor: '#FF6B9D',
    borderWidth: 4,
  },
  selectedStarter: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
    borderWidth: 4,
    shadowOpacity: 0.5,
    transform: [{ scale: 1.05 }],
  },
  starterErrorContainer: {
    marginTop: 18,
    padding: 16,
    backgroundColor: '#FFE5ED',
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B9D',
  },
  starterErrorText: {
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  starterImage: {
    width: 75,
    height: 75,
  },
  starterName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B9D',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 28,
    borderWidth: 3,
    borderColor: '#FFE5ED',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B9D',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFF5F8',
    borderWidth: 2.5,
    borderColor: '#FFE5ED',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B9D',
    borderWidth: 3,
  },
  errorContainer: {
    marginTop: 8,
    paddingLeft: 5,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF6B9D',
    marginBottom: 2,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  disabledButton: {
    backgroundColor: '#D0D0D0',
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  loginText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    color: '#FF6B9D',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    textAlign: 'center',
    marginTop: 26,
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SignupScreen;
