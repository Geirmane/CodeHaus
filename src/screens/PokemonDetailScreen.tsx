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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePokemonDetail } from '../hooks/usePokemonDetail';
import { MainStackParamList } from '../navigation/types';
import { capitalize, formatPokemonId, getSpriteUri } from '../utils/pokemon';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<MainStackParamList, 'PokemonDetail'>;

export const PokemonDetailScreen = ({ route }: Props) => {
  const { pokemonId, name } = route.params;
  const { bundle, loading, error, refresh } = usePokemonDetail(pokemonId);
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading && !bundle) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.text }]}>Loading {capitalize(name)}...</Text>
      </View>
    );
  }

  if (!bundle) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error ?? 'Unable to load this Pokémon.'}</Text>
      </View>
    );
  }

  const spriteUri = getSpriteUri(bundle.detail.sprites);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
      }
    >
      {error && (
        <View style={[
          styles.errorBanner,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.border,
            borderLeftColor: colors.error,
          }
        ]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={[styles.errorHint, { color: colors.primary }]}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>
          {capitalize(bundle.detail.name)}
        </Text>
        <Text style={[styles.id, { color: colors.textSecondary }]}>
          {formatPokemonId(bundle.detail.id)}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{bundle.genera}</Text>

      {spriteUri ? (
        <View style={styles.spriteWrapper}>
          <View style={[
            styles.spriteBg,
            {
              backgroundColor: colors.primaryLight,
              opacity: theme === 'dark' ? 0.2 : 0.3,
            }
          ]} />
          <View style={[
            styles.spriteCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            }
          ]}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>Sprite</Text>
            <Image source={{ uri: spriteUri }} style={styles.sprite} resizeMode="contain" />
          </View>
        </View>
      ) : null}

      <View style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Flavor text</Text>
        <Text style={[styles.sectionBody, { color: colors.text }]}>{bundle.flavorText}</Text>
      </View>

      <View style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Types</Text>
        <View style={styles.tagRow}>
          {bundle.detail.types.map(({ type }) => (
            <View
              key={type.name}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                }
              ]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                {capitalize(type.name)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Abilities</Text>
        <Text style={[styles.sectionBody, { color: colors.text }]}>
          {bundle.detail.abilities.map(({ ability }) => capitalize(ability.name)).join(', ')}
        </Text>
      </View>

      <View style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Base stats</Text>
        {bundle.detail.stats.map(({ stat, base_stat }) => (
          <View
            key={stat.name}
            style={[
              styles.statRow,
              {
                borderBottomColor: colors.border,
              }
            ]}
          >
            <Text style={[styles.statName, { color: colors.textSecondary }]}>
              {capitalize(stat.name)}
            </Text>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBarBg, { backgroundColor: colors.primaryLight }]}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${(base_stat / 255) * 100}%`,
                      backgroundColor: colors.primary,
                    }
                  ]}
                />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>{base_stat}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}>
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Evolution chain</Text>
        {bundle.evolutions.length ? (
          <View style={styles.evolutionRow}>
            {bundle.evolutions.map((evo, index) => (
              <React.Fragment key={`${evo.name}-${evo.id}`}>
                <View style={[
                  styles.evolutionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }
                ]}>
                  <Text style={[styles.evolutionName, { color: colors.text }]}>
                    {capitalize(evo.name)}
                  </Text>
                  <Text style={[styles.evolutionId, { color: colors.textSecondary }]}>
                    {formatPokemonId(evo.id)}
                  </Text>
                </View>
                {index < bundle.evolutions.length - 1 && (
                  <Text style={[styles.evolutionArrow, { color: colors.primary }]}>→</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
            No evolution data available.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderWidth: 2,
  },
  errorText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
  errorHint: {
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 14,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  id: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '500',
  },
  spriteWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  spriteBg: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 200,
    borderRadius: 32,
  },
  spriteCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sprite: {
    width: '100%',
    height: 220,
  },
  section: {
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionBody: {
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  tagText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  statName: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 100,
  },
  statBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontWeight: '800',
    fontSize: 15,
    minWidth: 35,
    textAlign: 'right',
  },
  evolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  evolutionCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  evolutionName: {
    fontWeight: '700',
    fontSize: 15,
  },
  evolutionId: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  evolutionArrow: {
    fontSize: 24,
    fontWeight: '700',
  },
});

