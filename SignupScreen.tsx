import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { useTheme } from './src/context/ThemeContext';

type SignupScreenProps = {
  onNavigateToLogin: () => void;
};

type StarterPokemon = {
  id: number;
  name: string;
  sprite: string;
};

// Starter Card Component with Animation
const StarterCard: React.FC<{
  starter: StarterPokemon;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
  colors: any;
  hasError: boolean;
}> = ({ starter, isSelected, onPress, disabled, colors, hasError }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [isSelected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.starterCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            shadowColor: colors.shadow,
          },
          isSelected && styles.selectedStarter,
          hasError && !isSelected && {
            borderColor: colors.error,
            borderWidth: 3,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={[
          styles.starterImageContainer,
          isSelected && { backgroundColor: colors.primaryLight }
        ]}>
          <Image
            source={{ uri: starter.sprite }}
            style={styles.starterImage}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.starterName, { color: colors.primary }]}>
          {starter.name.charAt(0).toUpperCase() + starter.name.slice(1)}
        </Text>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Gradient Background Effect */}
      <View style={[styles.gradientBackground, { backgroundColor: colors.primary }]} />
      <View style={[styles.gradientOverlay, { backgroundColor: colors.background }]} />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.primary }]}>Begin Your Journey!</Text>
              <View style={[styles.titleUnderline, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your Trainer Account
            </Text>
          </View>

          {/* Starter Selection */}
          <View style={styles.starterSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Choose Your Starter Pokémon
            </Text>
            <View style={styles.starterContainer}>
              {starters.map((starter) => (
                <StarterCard
                  key={starter.id}
                  starter={starter}
                  isSelected={selectedStarter === starter.id}
                  onPress={() => {
                    setSelectedStarter(starter.id);
                    setStarterError('');
                  }}
                  disabled={isLoading}
                  colors={colors}
                  hasError={!!starterError && !selectedStarter}
                />
              ))}
            </View>
            {starterError && (
              <View style={[styles.starterErrorContainer, { backgroundColor: colors.primaryLight, borderLeftColor: colors.error }]}>
                <Text style={[styles.starterErrorText, { color: colors.error }]}>
                  ⚠️ {starterError}
                </Text>
              </View>
            )}
          </View>

          {/* Signup Form */}
          <View style={[
            styles.formContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            }
          ]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.primary }]}>Email</Text>
              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme === 'dark' ? colors.surface : colors.primaryLight,
                  borderColor: focusedInput === 'email' ? colors.primary : colors.border,
                },
                focusedInput === 'email' && {
                  borderWidth: 3,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
                emailErrors.length > 0 && {
                  borderColor: colors.error,
                  borderWidth: 3,
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
                  placeholder="trainer@pokemon.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              {emailErrors.length > 0 && (
                <View style={styles.errorContainer}>
                  {emailErrors.map((error, index) => (
                    <Text key={index} style={[styles.errorText, { color: colors.error }]}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.primary }]}>Password</Text>
              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme === 'dark' ? colors.surface : colors.primaryLight,
                  borderColor: focusedInput === 'password' ? colors.primary : colors.border,
                },
                focusedInput === 'password' && {
                  borderWidth: 3,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
                passwordErrors.length > 0 && {
                  borderColor: colors.error,
                  borderWidth: 3,
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: 'transparent', paddingRight: 40 }]}
                  placeholder="Strong password required"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <View style={styles.eyeIconContainer}>
                      <View style={[styles.eyeIcon, { borderColor: colors.textSecondary }]}>
                        <View style={[styles.eyePupil, { backgroundColor: colors.textSecondary }]} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.eyeIconContainer}>
                      <View style={[styles.eyeIconClosed, { borderColor: colors.textSecondary }]}>
                        <View style={[styles.eyeLine, { backgroundColor: colors.textSecondary }]} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {passwordErrors.length > 0 && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorTitle, { color: colors.error }]}>
                    Password must include:
                  </Text>
                  {passwordErrors.map((error, index) => (
                    <Text key={index} style={[styles.errorText, { color: colors.error }]}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.primary }]}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme === 'dark' ? colors.surface : colors.primaryLight,
                  borderColor: focusedInput === 'confirmPassword' ? colors.primary : colors.border,
                },
                focusedInput === 'confirmPassword' && {
                  borderWidth: 3,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
                confirmPasswordError && {
                  borderColor: colors.error,
                  borderWidth: 3,
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: 'transparent', paddingRight: 40 }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <View style={styles.eyeIconContainer}>
                      <View style={[styles.eyeIcon, { borderColor: colors.textSecondary }]}>
                        <View style={[styles.eyePupil, { backgroundColor: colors.textSecondary }]} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.eyeIconContainer}>
                      <View style={[styles.eyeIconClosed, { borderColor: colors.textSecondary }]}>
                        <View style={[styles.eyeLine, { backgroundColor: colors.textSecondary }]} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {confirmPasswordError && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    • {confirmPasswordError}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.borderLight,
                  shadowColor: colors.primary,
                },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>
                  Start Adventure →
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already a Trainer?{' '}
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            Your adventure awaits! 🎮
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  starterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.8,
  },
  starterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  starterCard: {
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    width: 110,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  selectedStarter: {
    borderWidth: 4,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  starterImageContainer: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
  },
  starterImage: {
    width: 80,
    height: 80,
  },
  starterName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  starterErrorContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
  },
  starterErrorText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  formContainer: {
    borderRadius: 32,
    padding: 32,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 2.5,
    overflow: 'hidden',
    position: 'relative',
  },
  input: {
    padding: 18,
    fontSize: 16,
    fontWeight: '500',
    borderRadius: 20,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyeIconClosed: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeLine: {
    width: 16,
    height: 1.5,
    borderRadius: 1,
  },
  errorContainer: {
    marginTop: 10,
    paddingLeft: 6,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    minHeight: 60,
  },
  disabledButton: {
    backgroundColor: '#D0D0D0',
    borderColor: '#E0E0E0',
    shadowOpacity: 0,
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
});

export default SignupScreen;
