import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PokemonDetail } from '../types/pokemon';
import { capitalize, formatPokemonId, getSpriteUri } from '../utils/pokemon';
import { useTheme } from '../context/ThemeContext';

type Props = {
  pokemon: PokemonDetail;
  onPress: (pokemonId: number, name: string) => void;
};

export const PokemonCard = ({ pokemon, onPress }: Props) => {
  const { colors } = useTheme();
  const spriteUri = getSpriteUri(pokemon.sprites);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => onPress(pokemon.id, pokemon.name)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {capitalize(pokemon.name)}
        </Text>
        <Text style={[styles.cardId, { color: colors.textSecondary }]}>
          {formatPokemonId(pokemon.id)}
        </Text>
      </View>

      {spriteUri ? (
        <Image source={{ uri: spriteUri }} style={styles.sprite} resizeMode="contain" />
      ) : (
        <View
          style={[
            styles.spritePlaceholder,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.spritePlaceholderText, { color: colors.primary }]}>
            No image
          </Text>
        </View>
      )}

      <View style={styles.tagRow}>
        {pokemon.types.map(({ type }) => (
          <View
            key={type.name}
            style={[
              styles.tag,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: colors.primary }]}>
              {capitalize(type.name)}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 3,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardId: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sprite: {
    width: '100%',
    height: 150,
    marginBottom: 16,
  },
  spritePlaceholder: {
    height: 150,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  spritePlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

