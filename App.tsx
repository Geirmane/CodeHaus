import 'react-native-gesture-handler';
import '@react-native-firebase/app';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MainStackParamList, TabParamList } from './src/navigation/types';
import { PokedexScreen } from './src/screens/PokedexScreen';
import { PokemonDetailScreen } from './src/screens/PokemonDetailScreen';
import { HuntScreen } from './src/screens/HuntScreen';
import { ARCameraScreen } from './src/screens/ARCameraScreen';
import { capitalize } from './src/utils/pokemon';
import LoadingScreen from './LoadingScreen';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import { DrawerMenu } from './src/components/DrawerMenu';

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const getScreenOptions = (colors: any): NativeStackNavigationOptions => ({
  headerStyle: { 
    backgroundColor: colors.primary,
  },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '800', fontSize: 20 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
});

const PokedexTab = () => {
  const { colors } = useTheme();
  return (
    <MainStack.Navigator screenOptions={getScreenOptions(colors)}>
      <MainStack.Screen name="Pokedex" component={PokedexScreen} options={{ title: 'Pokédex', headerShown: false }} />
      <MainStack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={({ route }) => ({
          title: capitalize(route.params.name),
        })}
      />
    </MainStack.Navigator>
  );
};

const HuntTabWithMenu = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { colors } = useTheme();
  
  return (
    <>
      <MainStack.Navigator screenOptions={getScreenOptions(colors)}>
        <MainStack.Screen 
          name="Hunt" 
          component={HuntScreen} 
          options={{ 
            title: 'Hunt Pokémon',
            headerRight: () => (
              <TouchableOpacity
                style={headerStyles.menuButton}
                onPress={() => setDrawerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={headerStyles.menuButtonText}>☰</Text>
              </TouchableOpacity>
            ),
          }} 
        />
        <MainStack.Screen
          name="PokemonDetail"
          component={PokemonDetailScreen}
          options={({ route }) => ({
            title: capitalize(route.params.name),
          })}
        />
      </MainStack.Navigator>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} topOffset={0} />
    </>
  );
};

const HuntTab = () => <HuntTabWithMenu />;

const ARCameraTab = () => {
  const { colors } = useTheme();
  return (
    <MainStack.Navigator screenOptions={getScreenOptions(colors)}>
      <MainStack.Screen 
        name="ARCamera" 
        component={ARCameraScreen} 
        options={{ 
          title: 'AR Camera', 
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' }, // Override theme background for camera screen
        }} 
      />
    </MainStack.Navigator>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 0.75 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AppContentWithTheme />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContentWithTheme() {
  const { theme, colors } = useTheme();
  
  return (
    <>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'light-content'} 
        backgroundColor={colors.primary} 
      />
      <AppContent />
    </>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const [hasSeenAuth, setHasSeenAuth] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if user has seen auth screens before
    const checkAuthHistory = async () => {
      const seen = await AsyncStorage.getItem('hasSeenAuth');
      setHasSeenAuth(seen === 'true');
      // For new users, show signup screen
      if (seen !== 'true') {
        setShowLogin(false);
      }
    };
    checkAuthHistory();
  }, []);

  useEffect(() => {
    // Mark that user has seen auth screens
    const markAuthSeen = async () => {
      if (!user && hasSeenAuth !== null) {
        await AsyncStorage.setItem('hasSeenAuth', 'true');
      }
    };
    markAuthSeen();
  }, [user, hasSeenAuth]);

  if (loading || hasSeenAuth === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show auth screens if user is not logged in
  if (!user) {
    return showLogin ? (
      <LoginScreen onNavigateToSignup={() => setShowLogin(false)} />
    ) : (
      <SignupScreen onNavigateToLogin={() => setShowLogin(true)} />
    );
  }

  // User is logged in - show main app with navigation
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 2,
            paddingBottom: 10,
            paddingTop: 10,
            height: 70,
            elevation: 25,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            borderRadius: 20,
            marginHorizontal: 15,
            marginBottom: 20,
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="PokedexTab"
          component={PokedexTab}
          options={{
            title: 'Pokédex',
            tabBarIcon: () => <TabIcon emoji="📖" />,
          }}
        />
        <Tab.Screen
          name="HuntTab"
          component={HuntTab}
          options={{
            title: 'Hunt',
            tabBarIcon: () => <TabIcon emoji="🗺️" />,
          }}
        />
        <Tab.Screen
          name="ARCameraTab"
          component={ARCameraTab}
          options={{
            title: 'AR',
            tabBarIcon: () => <TabIcon emoji="📷" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const TabIcon = ({ emoji }: { emoji: string }) => (
  <Text style={styles.tabIcon}>{emoji}</Text>
);

const headerStyles = StyleSheet.create({
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 26,
  },
});

export default App;
