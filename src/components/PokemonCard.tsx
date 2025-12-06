import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PokemonDetail } from '../types/pokemon';
import { capitalize, formatPokemonId, getSpriteUri } from '../utils/pokemon';

type Props = {
  pokemon: PokemonDetail;
  onPress: (pokemonId: number, name: string) => void;
};

export const PokemonCard = ({ pokemon, onPress }: Props) => {
  const spriteUri = getSpriteUri(pokemon.sprites);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(pokemon.id, pokemon.name)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{capitalize(pokemon.name)}</Text>
        <Text style={styles.cardId}>{formatPokemonId(pokemon.id)}</Text>
      </View>

      {spriteUri ? (
        <Image source={{ uri: spriteUri }} style={styles.sprite} resizeMode="contain" />
      ) : (
        <View style={styles.spritePlaceholder}>
          <Text style={styles.spritePlaceholderText}>No image</Text>
        </View>
      )}

      <View style={styles.tagRow}>
        {pokemon.types.map(({ type }) => (
          <View key={type.name} style={styles.tag}>
            <Text style={styles.tagText}>{capitalize(type.name)}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b1b1f',
  },
  cardId: {
    fontSize: 14,
    color: '#7b7b85',
  },
  sprite: {
    width: '100%',
    height: 140,
    marginBottom: 12,
  },
  spritePlaceholder: {
    height: 140,
    borderRadius: 12,
    backgroundColor: '#f0f0f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  spritePlaceholderText: {
    color: '#7b7b85',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#ffe0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b71c1c',
  },
});

