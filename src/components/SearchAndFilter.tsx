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
      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search by name, type, ability, or #ID"
          placeholderTextColor="#8c8c94"
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
              <ActivityIndicator size="small" color="#ef5350" />
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
    gap: 12,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ececf2',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ececf2',
  },
  clearButtonText: {
    color: '#4a4a4f',
    fontWeight: '600',
  },
  voiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ececf2',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  voiceButtonActive: {
    backgroundColor: '#ffe0e0',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  typeRow: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d0d0d8',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: '#ef5350',
    borderColor: '#ef5350',
  },
  chipText: {
    color: '#4a4a4f',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#fff',
  },
});

