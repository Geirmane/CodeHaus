import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PokemonDetail } from '../types/pokemon';
import { capitalize, formatPokemonId, getSpriteUri } from '../utils/pokemon';
import { useTheme } from '../context/ThemeContext';

type Props = {
  pokemon: PokemonDetail;
  onPress: (pokemonId: number, name: string) => void;
  isCaught?: boolean;
  isCapturedInPhoto?: boolean;
};

export const PokemonCard = ({ pokemon, onPress, isCaught = false, isCapturedInPhoto = false }: Props) => {
  const { colors } = useTheme();
  const spriteUri = getSpriteUri(pokemon.sprites);
  
  // Show full image if Pokémon is caught OR captured in a photo
  const showFullImage = isCaught || isCapturedInPhoto;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: showFullImage ? colors.primary : colors.border,
          shadowColor: colors.shadow,
          borderWidth: showFullImage ? 3 : 3,
        },
      ]}
      onPress={() => onPress(pokemon.id, pokemon.name)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {capitalize(pokemon.name)}
          </Text>
          {isCaught && (
            <View
              style={[
                styles.caughtBadge,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.caughtBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.cardId, { color: colors.textSecondary }]}>
            {formatPokemonId(pokemon.id)}
          </Text>
          <View style={[styles.tagRow, { marginTop: 8 }]}>
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
        </View>
      </View>

      <View style={styles.spriteContainer}>
        {spriteUri ? (
          <View style={styles.spriteWrapper}>
            {showFullImage ? (
              <Image 
                source={{ uri: spriteUri }} 
                style={styles.sprite} 
                resizeMode="contain" 
              />
            ) : (
              <View style={[styles.shadowContainer, { backgroundColor: colors.background }]}>
                <Image 
                  source={{ uri: spriteUri }} 
                  style={styles.shadowSprite} 
                  resizeMode="contain" 
                />
              </View>
            )}
          </View>
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
        {isCapturedInPhoto && (
          <View style={styles.pokeballIndicator}>
            <View style={styles.pokeballTop} />
            <View style={styles.pokeballCenter}>
              <Text style={styles.pokeballCheckmark}>✓</Text>
            </View>
            <View style={styles.pokeballBottom} />
          </View>
        )}
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.8,
    flex: 1,
  },
  caughtBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caughtBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  cardId: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spriteContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    marginBottom: 16,
  },
  spriteWrapper: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  sprite: {
    width: '100%',
    height: 150,
  },
  shadowContainer: {
    width: '100%',
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowSprite: {
    width: '100%',
    height: 150,
    opacity: 0.3,
    tintColor: '#000000',
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
    gap: 6,
    justifyContent: 'flex-end',
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
  pokeballIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FF0000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pokeballCenter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    marginTop: -6,
    marginLeft: -6,
    zIndex: 1,
  },
  pokeballBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  pokeballCheckmark: {
    fontSize: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

