import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const { theme, colors, setTheme } = useTheme();

  const themes = [
    { id: 'light' as const, name: 'Light', emoji: '☀️', description: 'Bright and cheerful' },
    { id: 'dark' as const, name: 'Dark', emoji: '🌙', description: 'Easy on the eyes' },
    { id: 'forest' as const, name: 'Forest', emoji: '🌲', description: 'Natural green tones' },
    { id: 'ocean' as const, name: 'Ocean', emoji: '🌊', description: 'Calming blue hues' },
    { id: 'summer' as const, name: 'Summer', emoji: '☀️', description: 'Warm and vibrant' },
    { id: 'midnight' as const, name: 'Midnight', emoji: '🌃', description: 'Deep purple night' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Themes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your preferred color theme
          </Text>
        </View>

        <View style={styles.themesContainer}>
          {themes.map((themeOption) => {
            const isSelected = theme === themeOption.id;
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 3 : 2,
                  },
                ]}
                onPress={() => setTheme(themeOption.id)}
                activeOpacity={0.7}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeEmoji}>{themeOption.emoji}</Text>
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeName, { color: colors.text }]}>
                      {themeOption.name}
                    </Text>
                    <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                      {themeOption.description}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                    <Text style={styles.selectedCheckmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.previewSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
          <View style={styles.previewContent}>
            <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.previewHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.previewHeaderText}>Sample Card</Text>
              </View>
              <View style={styles.previewBody}>
                <Text style={[styles.previewText, { color: colors.text }]}>
                  This is how your app will look with the {themes.find(t => t.id === theme)?.name.toLowerCase()} theme.
                </Text>
                <View style={[styles.previewButton, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.previewButtonText, { color: colors.primary }]}>
                    Sample Button
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  themesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  themeCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  themeDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedCheckmark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  previewSection: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  previewContent: {
    gap: 12,
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  previewHeader: {
    padding: 16,
  },
  previewHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  previewBody: {
    padding: 16,
    gap: 12,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});


