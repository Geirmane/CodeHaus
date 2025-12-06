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
import { useAuth } from '../../AuthContext';

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  topOffset?: number;
};

export const DrawerMenu = ({ visible, onClose, topOffset = 0 }: DrawerMenuProps) => {
  const { signOut, user } = useAuth();
  const [slideAnim] = useState(new Animated.Value(300));
  const insets = useSafeAreaInsets();

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
    // TODO: Navigate to Profile screen
    Alert.alert('Profile', 'Profile screen coming soon!');
  };

  const handleSettings = () => {
    onClose();
    // TODO: Navigate to Settings screen
    Alert.alert('Settings', 'Settings screen coming soon!');
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
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.drawer,
                {
                  transform: [{ translateX: slideAnim }],
                  paddingTop: topOffset > 0 ? insets.top + topOffset : insets.top,
                },
              ]}
            >
              <View style={[styles.drawerHeader, { paddingTop: topOffset > 0 ? 0 : 20 }]}>
                <Text style={styles.drawerTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {user && (
                <View style={styles.userInfo}>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              )}

              <View style={styles.menuItems}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleProfile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemIcon}>👤</Text>
                  <Text style={styles.menuItemText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSettings}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemIcon}>⚙️</Text>
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemIcon}>🚪</Text>
                  <Text style={[styles.menuItemText, styles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 3,
    borderColor: '#FFE5ED',
    borderRightWidth: 0,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE5ED',
  },
  drawerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF6B9D',
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE5ED',
  },
  userEmail: {
    fontSize: 15,
    color: '#FF6B9D',
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
    color: '#333',
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    backgroundColor: '#FFE5ED',
    marginVertical: 8,
    marginHorizontal: 24,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: '#FF6B9D',
  },
});

