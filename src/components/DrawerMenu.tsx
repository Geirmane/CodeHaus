import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MainStackParamList } from '../navigation/types';

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  topOffset?: number;
  navigation?: any;
};

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const DrawerMenu = ({ visible, onClose, topOffset = 0, navigation: navigationProp }: DrawerMenuProps) => {
  const { signOut, user } = useAuth();
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(300));
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  
  // Use prop navigation if provided, otherwise use hook navigation
  const nav = navigationProp || navigation;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleProfile = () => {
    onClose();
    nav.navigate('Profile');
  };

  const handleSettings = () => {
    onClose();
    nav.navigate('Settings');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            onClose();
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ translateX: slideAnim }],
                paddingTop: topOffset > 0 ? insets.top + topOffset : insets.top,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.drawerHeader, { borderBottomColor: colors.border, paddingTop: topOffset > 0 ? 0 : 20 }]}>
              <Text style={[styles.drawerTitle, { color: colors.primary }]}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.closeButtonText, { color: colors.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {user && (
              <View style={[styles.userInfo, { borderBottomColor: colors.border }]}>
                <Text style={[styles.userEmail, { color: colors.primary }]}>{user.email}</Text>
              </View>
            )}

            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleProfile}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>⚙️</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, styles.logoutText, { color: colors.primary }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawer: {
    width: 280,
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 3,
    borderRightWidth: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
  },
  drawerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 2,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  menuItems: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingLeft: 24,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    marginVertical: 8,
    marginHorizontal: 24,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    // Color applied dynamically
  },
});

