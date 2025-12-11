import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  availableTypes: string[];
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onVoiceSearch?: () => void;
  isVoiceSearching?: boolean;
};

export const SearchAndFilter = ({
  searchText,
  onSearchChange,
  selectedType,
  onTypeSelect,
  availableTypes,
  onClear,
  onFocus,
  onBlur,
  onVoiceSearch,
  isVoiceSearching = false,
}: Props) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Search by name, type, ability, or #ID"
          placeholderTextColor={colors.borderLight}
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              shadowColor: colors.shadow,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {onVoiceSearch && (
          <TouchableOpacity
            onPress={onVoiceSearch}
            style={styles.micButton}
            disabled={isVoiceSearching}
          >
            {isVoiceSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={styles.micIconContainer}>
                {/* Google-style minimal microphone icon */}
                <View style={[styles.micIconBody, { borderColor: colors.primary }]} />
                <View style={[styles.micIconStand, { backgroundColor: colors.primary }]} />
              </View>
            )}
          </TouchableOpacity>
        )}
        {(searchText || selectedType) && (
          <TouchableOpacity
            onPress={onClear}
            style={[
              styles.clearButton,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 2,
    fontWeight: '500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  micIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  micIconBody: {
    width: 12,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    position: 'relative',
    top: 0,
  },
  micIconStand: {
    width: 4,
    height: 6,
    position: 'absolute',
    bottom: -1,
    left: '50%',
    marginLeft: -2,
    borderRadius: 0,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
  },
  clearButtonText: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

