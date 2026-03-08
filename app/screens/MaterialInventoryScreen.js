// app/screens/MaterialInventoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials, deleteMaterial } from '../database/materialQueries';
import { COLORS, SHADOWS } from '../theme/theme';

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
    <View style={styles.row}>
      <View style={styles.imgBox}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" />
          : <Text style={styles.imgFallback}>📦</Text>
        }
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MATÉRIELS ENREGISTRÉS ({materials.length})</Text>
      </View>

      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun matériel enregistré</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    ...SHADOWS.pill,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    padding: 10,
    ...SHADOWS.card,
  },
  imgBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 28 },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
  },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: COLORS.navyBlue,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 18 },
  deleteBtn: {
    backgroundColor: COLORS.redBurgundy,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontStyle: 'italic', fontSize: 15 },
});

export default MaterialInventoryScreen;
