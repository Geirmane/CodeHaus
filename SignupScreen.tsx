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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { useTheme } from './src/context/ThemeContext';

type SignupScreenProps = {
  onNavigateToLogin: () => void;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
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
            <Text style={[styles.title, { color: colors.text }]}>Begin Your Journey!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your Trainer Account
            </Text>
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
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
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
    fontWeight: '400',
    marginBottom: 12,
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
    fontWeight: '400',
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
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
