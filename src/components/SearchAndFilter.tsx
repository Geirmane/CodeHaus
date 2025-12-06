import React from 'react';
import {
  ScrollView,
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
};

export const SearchAndFilter = ({
  searchText,
  onSearchChange,
  selectedType,
  onTypeSelect,
  availableTypes,
  onClear,
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
  typeRow: {
    gap: 6,
    paddingRight: 12,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  chipText: {
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 11,
    letterSpacing: 0.1,
  },
});

