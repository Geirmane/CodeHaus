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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#FFE5ED',
    shadowColor: '#FF6B9D',
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
    color: '#FF6B9D',
    letterSpacing: 0.8,
  },
  cardId: {
    fontSize: 15,
    color: '#FF6B9D',
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
    backgroundColor: '#FFF5F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE5ED',
  },
  spritePlaceholderText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#FFE5ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: 0.5,
  },
});

