// app/screens/MaterialInventoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials, deleteMaterial } from '../database/materialQueries';
import { COLORS, CARD_SHADOW, SHADOWS } from '../theme/theme';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';

const MaterialInventoryScreen = ({ navigation }) => {
  const [materials, setMaterials] = useState([]);

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  const load = async () => {
    const data = await getAllMaterials();
    setMaterials(data);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Supprimer',
      `Supprimer "${item.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          await deleteMaterial(item.id);
          load();
        }},
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Image grande */}
      <View style={styles.imgBox}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" />
          : <Text style={styles.imgFallback}>📦</Text>
        }
      </View>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddMaterial', { editItem: item })}
        >
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <WallpaperBg>
      <PillHeader title={`Matériels enregistrés (${materials.length})`} />

      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.colWrap}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun matériel enregistré</Text>
          </View>
        }
      />
    </WallpaperBg>
  );
};

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  colWrap: { justifyContent: 'center', marginBottom: 20 },

  // Cartes agrandies comme MaterialSelectionScreen
  card: {
    width: 200, margin: 10, borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', padding: 12, ...CARD_SHADOW,
  },
  imgBox: {
    width: 140, height: 130, backgroundColor: '#fff', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10,
  },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 50 },
  name: {
    fontSize: 14, fontWeight: '900', fontStyle: 'italic',
    color: COLORS.navyBlue, textTransform: 'uppercase', textAlign: 'center',
    fontFamily: 'serif', marginBottom: 10, lineHeight: 18,
  },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    backgroundColor: COLORS.navyBlue,
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { fontSize: 20 },
  deleteBtn: {
    backgroundColor: COLORS.redBurgundy,
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontStyle: 'italic', fontSize: 16, fontFamily: 'serif' },
});

export default MaterialInventoryScreen;
