import 'react-native-gesture-handler';
import '@react-native-firebase/app';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
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
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: '#ef5350' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

const PokedexTab = () => (
  <MainStack.Navigator screenOptions={screenOptions}>
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

const HuntTab = () => (
  <MainStack.Navigator screenOptions={screenOptions}>
    <MainStack.Screen name="Hunt" component={HuntScreen} options={{ title: 'Hunt Pokémon' }} />
    <MainStack.Screen
      name="PokemonDetail"
      component={PokemonDetailScreen}
      options={({ route }) => ({
        title: capitalize(route.params.name),
      })}
    />
  </MainStack.Navigator>
);

const ARCameraTab = () => (
  <MainStack.Navigator screenOptions={screenOptions}>
    <MainStack.Screen name="ARCamera" component={ARCameraScreen} options={{ title: 'AR Camera', headerShown: false }} />
  </MainStack.Navigator>
);

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#ef5350" />
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ef5350" />
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
          tabBarActiveTintColor: '#ef5350',
          tabBarInactiveTintColor: '#7b7b85',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#ececf2',
            borderTopWidth: 1,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
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
  <Text style={{ fontSize: 24 }}>{emoji}</Text>
);

export default App;
