import React, { useState } from 'react';
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
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

type LoginScreenProps = {
  onNavigateToSignup: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Google credentials';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled in Firebase Console';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Google Sign-In Failed', errorMessage);
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
        {/* Header with Pikachu Animation */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back, Trainer!</Text>
          <LottieView
            source={require('./assets/Pikachu.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ash@pokemon.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToSignup} disabled={isLoading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Gotta Catch 'Em All! ⚡</Text>
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FF6B9D',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 107, 157, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  animation: {
    width: 220,
    height: 220,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 28,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#FFE5ED',
  },
  inputContainer: {
    marginBottom: 22,
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
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FFE5ED',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF6B9D',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  googleButtonText: {
    color: '#FF6B9D',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  signupText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
  signupLink: {
    color: '#FF6B9D',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    textAlign: 'center',
    marginTop: 35,
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
