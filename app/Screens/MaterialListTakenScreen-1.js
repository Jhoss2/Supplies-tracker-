// app/screens/MaterialListTakenScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { getMaterialsByIds } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';

const MaterialListTakenScreen = ({ route }) => {
  const { materialIds } = route.params;
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getMaterialsByIds(materialIds);
    setMaterials(data);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imgBox}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" />
          : <Text style={styles.imgFallback}>📦</Text>
        }
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <WallpaperBg>
      <PillHeader title={`Matériel pris (${materials.length})`} />
      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={4}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </WallpaperBg>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  list: { padding: 16 },
  card: {
    flex: 1,
    margin: 8,
    maxWidth: '25%',
    backgroundColor: 'transparent',
    borderRadius: RADIUS.card,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    alignItems: 'center',
    padding: 12,
    ...CARD_SHADOW,
  },
  imgBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 36 },
  name: {
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default MaterialListTakenScreen;
