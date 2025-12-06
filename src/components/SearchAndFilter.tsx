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
          placeholderTextColor="#FFB3D1"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {onVoiceSearch && (
          <TouchableOpacity
            onPress={onVoiceSearch}
            style={[styles.voiceButton, isVoiceSearching && styles.voiceButtonActive]}
            disabled={isVoiceSearching}
          >
            {isVoiceSearching ? (
              <ActivityIndicator size="small" color="#FF6B9D" />
            ) : (
              <Text style={styles.voiceButtonText}>🎤</Text>
            )}
          </TouchableOpacity>
        )}
        {(searchText || selectedType) && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
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

const FilterChip = ({ label, selected, onPress }: FilterChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    activeOpacity={0.8}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

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
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 3,
    borderColor: '#FFE5ED',
    color: '#333',
    fontWeight: '500',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#FFE5ED',
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  clearButtonText: {
    color: '#FF6B9D',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  voiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFE5ED',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  voiceButtonActive: {
    backgroundColor: '#FFE5ED',
    borderColor: '#FF6B9D',
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
    borderColor: '#FFE5ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
    shadowOpacity: 0.3,
  },
  chipText: {
    color: '#FF6B9D',
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

