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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef5350',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  starterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  starterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  starterCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: 100,
    borderWidth: 3,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starterCardError: {
    borderColor: '#ef5350',
    borderWidth: 3,
  },
  selectedStarter: {
    borderColor: '#ef5350',
    backgroundColor: '#fff5f5',
  },
  starterErrorContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ef5350',
  },
  starterErrorText: {
    fontSize: 14,
    color: '#ef5350',
    fontWeight: '600',
    textAlign: 'center',
  },
  starterImage: {
    width: 70,
    height: 70,
  },
  starterName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ef5350',
    borderWidth: 2,
  },
  errorContainer: {
    marginTop: 8,
    paddingLeft: 5,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef5350',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef5350',
    marginBottom: 2,
  },
  signupButton: {
    backgroundColor: '#ef5350',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#ef5350',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default SignupScreen;
