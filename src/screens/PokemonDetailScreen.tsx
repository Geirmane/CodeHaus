import React from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { usePokemonDetail } from '../hooks/usePokemonDetail';
import { MainStackParamList } from '../navigation/types';
import { capitalize, formatPokemonId, getSpriteUri } from '../utils/pokemon';

type Props = NativeStackScreenProps<MainStackParamList, 'PokemonDetail'>;

export const PokemonDetailScreen = ({ route }: Props) => {
  const { pokemonId, name } = route.params;
  const { bundle, loading, error, refresh } = usePokemonDetail(pokemonId);

  if (loading && !bundle) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ef5350" />
        <Text style={styles.loaderText}>Loading {capitalize(name)}...</Text>
      </View>
    );
  }

  if (!bundle) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error ?? 'Unable to load this Pokémon.'}</Text>
      </View>
    );
  }

  const spriteUri = getSpriteUri(bundle.detail.sprites);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#ef5350" />
      }
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.errorHint}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>
        {capitalize(bundle.detail.name)} <Text style={styles.id}>{formatPokemonId(bundle.detail.id)}</Text>
      </Text>
      <Text style={styles.subtitle}>{bundle.genera}</Text>

      {spriteUri ? (
        <View style={styles.spriteWrapper}>
          <View style={styles.spriteBg} />
          <View style={styles.spriteCard}>
            <Text style={styles.sectionLabel}>Sprite</Text>
            <Image source={{ uri: spriteUri }} style={styles.sprite} resizeMode="contain" />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Flavor text</Text>
        <Text style={styles.sectionBody}>{bundle.flavorText}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Types</Text>
        <View style={styles.tagRow}>
          {bundle.detail.types.map(({ type }) => (
            <View key={type.name} style={styles.tag}>
              <Text style={styles.tagText}>{capitalize(type.name)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Abilities</Text>
        <Text style={styles.sectionBody}>
          {bundle.detail.abilities.map(({ ability }) => capitalize(ability.name)).join(', ')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Base stats</Text>
        {bundle.detail.stats.map(({ stat, base_stat }) => (
          <View key={stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{capitalize(stat.name)}</Text>
            <Text style={styles.statValue}>{base_stat}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Evolution chain</Text>
        {bundle.evolutions.length ? (
          <View style={styles.evolutionRow}>
            {bundle.evolutions.map((evo, index) => (
              <React.Fragment key={`${evo.name}-${evo.id}`}>
                <View style={styles.evolutionCard}>
                  <Text style={styles.evolutionName}>{capitalize(evo.name)}</Text>
                  <Text style={styles.evolutionId}>{formatPokemonId(evo.id)}</Text>
                </View>
                {index < bundle.evolutions.length - 1 && <Text style={styles.evolutionArrow}>→</Text>}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionBody}>No evolution data available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7f7fb',
    gap: 12,
  },
  loaderText: {
    color: '#4a4a4f',
  },
  errorBanner: {
    backgroundColor: '#ffe0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#b71c1c',
    textAlign: 'center',
  },
  errorHint: {
    color: '#7b7b85',
    marginTop: 4,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1f',
  },
  id: {
    fontSize: 16,
    color: '#7b7b85',
  },
  subtitle: {
    color: '#4a4a4f',
    marginTop: 4,
    marginBottom: 16,
  },
  spriteWrapper: {
    marginBottom: 16,
  },
  spriteBg: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#fde0dc',
    borderRadius: 24,
  },
  spriteCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sprite: {
    width: '100%',
    height: 200,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1b1f',
    marginBottom: 8,
  },
  sectionBody: {
    color: '#4a4a4f',
    lineHeight: 20,
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
    fontWeight: '600',
    color: '#b71c1c',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ececf2',
  },
  statName: {
    color: '#4a4a4f',
  },
  statValue: {
    fontWeight: '700',
    color: '#1b1b1f',
  },
  evolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  evolutionCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
  },
  evolutionName: {
    fontWeight: '600',
    color: '#1b1b1f',
  },
  evolutionId: {
    color: '#7b7b85',
    marginTop: 4,
  },
  evolutionArrow: {
    fontSize: 20,
    color: '#7b7b85',
  },
});

