import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
  availableTypes: string[];
  onClear: () => void;
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
  onVoiceSearch,
  isVoiceSearching = false,
}: Props) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeRow}
      >
        <FilterChip
          label="All types"
          selected={selectedType === null}
          onPress={() => onTypeSelect(null)}
        />
        {availableTypes.map((type) => (
          <FilterChip
            key={type}
            label={type}
            selected={selectedType === type}
            onPress={() => onTypeSelect(type)}
          />
        ))}
      </ScrollView>

      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
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
            style={[
              styles.voiceButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
              isVoiceSearching && {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            disabled={isVoiceSearching}
          >
            {isVoiceSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.voiceButtonText}>🎤</Text>
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

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, selected, onPress }: FilterChipProps) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        selected && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? '#FFFFFF' : colors.primary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 3,
    fontWeight: '500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  clearButtonText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  voiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  voiceButtonText: {
    fontSize: 20,
  },
  typeRow: {
    gap: 10,
    paddingRight: 18,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

