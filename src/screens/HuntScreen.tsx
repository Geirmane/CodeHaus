import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getCurrentLocation,
  requestLocationAccess,
  watchLocation,
  clearWatch,
  Location,
  LocationError,
} from '../services/geolocation';
import { spawnPokemonNearby, SpawnedPokemon, removeSpawn } from '../services/pokemonSpawn';
import { MainStackParamList } from '../navigation/types';
import { capitalize } from '../utils/pokemon';
import { useCaughtPokemon } from '../hooks/useCaughtPokemon';

type Props = NativeStackScreenProps<MainStackParamList, 'Hunt'>;

export const HuntScreen = ({ navigation }: Props) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [spawns, setSpawns] = useState<SpawnedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [hunting, setHunting] = useState(false);
  const huntingRef = useRef(hunting);
  const webViewRef = useRef<WebView | null>(null);
  const { catchPokemon } = useCaughtPokemon();

  useEffect(() => {
    huntingRef.current = hunting;
  }, [hunting]);

  const loadLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationAccess();
      if (!hasPermission) {
        setError('Location permission is required to hunt Pokémon.');
        setLoading(false);
        return;
      }

      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Spawn initial Pokémon
      const initialSpawn = await spawnPokemonNearby(currentLocation);
      if (initialSpawn) {
        setSpawns([initialSpawn]);
      }

      // Start watching location
      const id = watchLocation(
        (newLocation) => {
          setLocation(newLocation);
          // Periodically spawn new Pokémon
          if (huntingRef.current && Math.random() > 0.7) {
            spawnPokemonNearby(newLocation).then((newSpawn) => {
              if (newSpawn) {
                setSpawns((prev) => [...prev, newSpawn]);
              }
            });
          }
        },
        (err: LocationError) => {
          setError(`Location error: ${err.message}`);
        },
      );

      setWatchId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleStartHunting = () => {
    setHunting(true);
    if (location) {
      spawnPokemonNearby(location).then((spawn) => {
        if (spawn) {
          setSpawns((prev) => [...prev, spawn]);
        }
      });
    }
  };

  const handleStopHunting = () => {
    setHunting(false);
  };

  const handlePokemonTap = (spawn: SpawnedPokemon) => {
    Alert.alert(
      capitalize(spawn.pokemon.name),
      `Found ${capitalize(spawn.pokemon.name)} nearby!`,
      [
        {
          text: 'View Details',
          onPress: () => {
            // Navigate to PokemonDetail in the same stack
            navigation.navigate('PokemonDetail', {
              pokemonId: spawn.pokemon.id,
              name: spawn.pokemon.name,
            });
          },
        },
        { text: 'Catch', onPress: () => handleCatchPokemon(spawn) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleCatchPokemon = async (spawn: SpawnedPokemon) => {
    try {
      await catchPokemon(spawn.pokemon.id, spawn.pokemon.name);
      removeSpawn(spawn.id);
      setSpawns((prev) => prev.filter((s) => s.id !== spawn.id));
      Alert.alert('Gotcha!', `You caught ${capitalize(spawn.pokemon.name)}!`);
    } catch (error) {
      console.error('Error catching pokemon:', error);
      Alert.alert('Error', 'Failed to save caught pokemon. Please try again.');
    }
  };

  const handleRefresh = () => {
    if (location) {
      spawnPokemonNearby(location).then((spawn) => {
        if (spawn) {
          setSpawns((prev) => [...prev, spawn]);
        }
      });
    }
  };

  const mapHtml = useMemo(() => {
    if (!location) {
      return '';
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
          <link href="https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.css" rel="stylesheet" />
          <style>
            html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
            .marker {
              background: #fff;
              border: 2px solid #ef5350;
              border-radius: 10px;
              padding: 4px 6px;
              font-size: 10px;
              font-weight: 600;
              color: #1b1b1f;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/maplibre-gl@3.6.1/dist/maplibre-gl.js"></script>
          <script>
            const map = new maplibregl.Map({
              container: 'map',
              style: {
                version: 8,
                sources: {
                  'osm-tiles': {
                    type: 'raster',
                    tiles: [
                      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                  }
                },
                layers: [
                  {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm-tiles',
                    minzoom: 0,
                    maxzoom: 19
                  }
                ]
              },
              center: [${location.longitude}, ${location.latitude}],
              zoom: 15
            });

            map.on('load', () => {
              map.addControl(new maplibregl.NavigationControl(), 'top-right');
            });

            let userMarker = null;
            const spawnMarkers = {};

            function updateLocation(lat, lng) {
              const coords = [lng, lat];
              if (!userMarker) {
                userMarker = new maplibregl.Marker({ color: '#1e88e5' })
                  .setLngLat(coords)
                  .addTo(map);
              } else {
                userMarker.setLngLat(coords);
              }
            }

            function updateSpawns(spawns) {
              const active = {};
              spawns.forEach((spawn) => {
                active[spawn.id] = true;
                if (!spawnMarkers[spawn.id]) {
                  const el = document.createElement('div');
                  el.className = 'marker';
                  el.textContent = spawn.name;
                  el.onclick = () => {
                    window.ReactNativeWebView &&
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'POKEMON_TAP', spawnId: spawn.id })
                      );
                  };

                  spawnMarkers[spawn.id] = new maplibregl.Marker(el)
                    .setLngLat([spawn.location.longitude, spawn.location.latitude])
                    .addTo(map);
                } else {
                  spawnMarkers[spawn.id].setLngLat([
                    spawn.location.longitude,
                    spawn.location.latitude,
                  ]);
                }
              });

              Object.keys(spawnMarkers).forEach((id) => {
                if (!active[id]) {
                  spawnMarkers[id].remove();
                  delete spawnMarkers[id];
                }
              });
            }

            function handleUpdate(payload) {
              if (payload.location) {
                updateLocation(payload.location.latitude, payload.location.longitude);
                map.flyTo({ center: [payload.location.longitude, payload.location.latitude], zoom: 15, essential: false });
              }
              if (payload.spawns) {
                updateSpawns(payload.spawns);
              }
            }

            function handleMessage(event) {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'UPDATE') {
                  handleUpdate(data);
                }
              } catch (err) {
                console.error('Map message error', err);
              }
            }

            document.addEventListener('message', handleMessage);
            window.addEventListener('message', handleMessage);

            handleUpdate({
              location: { latitude: ${location.latitude}, longitude: ${location.longitude} },
              spawns: ${JSON.stringify(
                spawns.map((spawn) => ({
                  id: spawn.id,
                  name: spawn.pokemon.name,
                  location: spawn.location,
                })),
              )},
            });
          </script>
        </body>
      </html>
    `;
  }, [location, spawns]);

  useEffect(() => {
    if (location && webViewRef.current) {
      const payload = {
        type: 'UPDATE',
        location,
        spawns: spawns.map((spawn) => ({
          id: spawn.id,
          name: spawn.pokemon.name,
          location: spawn.location,
        })),
      };

      webViewRef.current.postMessage(JSON.stringify(payload));
    }
  }, [location, spawns]);

  const handleMapMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'POKEMON_TAP') {
          const spawn = spawns.find((item) => item.id === data.spawnId);
          if (spawn) {
            handlePokemonTap(spawn);
          }
        }
      } catch (err) {
        console.warn('Failed to parse map message', err);
      }
    },
    [spawns],
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ef5350" />
        <Text style={styles.loaderText}>Finding your location...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Unable to get location'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLocation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mapHtml ? (
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: mapHtml }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          onMessage={handleMapMessage}
          setSupportMultipleWindows={false}
        />
      ) : null}

      <View style={styles.controls}>
        {!hunting ? (
          <TouchableOpacity style={styles.huntButton} onPress={handleStartHunting}>
            <Text style={styles.huntButtonText}>Start Hunting</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopHunting}>
            <Text style={styles.stopButtonText}>Stop Hunting</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {spawns.length > 0 && (
        <View style={styles.spawnInfo}>
          <Text style={styles.spawnInfoText}>Pokemons nearby</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: '#dfe7ef',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    gap: 12,
  },
  loaderText: {
    color: '#4a4a4f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    padding: 16,
    gap: 16,
  },
  errorText: {
    color: '#b71c1c',
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#ef5350',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  huntButton: {
    flex: 1,
    backgroundColor: '#ef5350',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  huntButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#b71c1c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ececf2',
  },
  refreshButtonText: {
    color: '#4a4a4f',
    fontWeight: '600',
  },
  spawnInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  spawnInfoText: {
    color: '#4a4a4f',
    fontWeight: '600',
    textAlign: 'center',
  },
});

