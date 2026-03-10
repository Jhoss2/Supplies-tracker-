// app/screens/MaterialInventoryScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials, deleteMaterial } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function MaterialInventoryScreen({ navigation }) {
  const [materials, setMaterials] = useState([]);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => setMaterials(await getAllMaterials());

  const handleDelete = (item) => {
    Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await deleteMaterial(item.id);
        load();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imgBox}>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" />
          : <Text style={styles.imgFallback}>📦</Text>
        }
      </View>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <PillHeader title="Inventaire du matériel" />
      <Text style={styles.count}>{materials.length} article{materials.length > 1 ? 's' : ''}</Text>
      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={4}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun matériel enregistré</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddMaterial')}>
        <Text style={styles.addBtnText}>➕ AJOUTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  count: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 13, marginBottom: 8 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flex: 1, maxWidth: '25%', margin: 8, backgroundColor: COLORS.navyBlue,
    borderRadius: 20, padding: 10, alignItems: 'center', ...CARD_SHADOW, position: 'relative',
  },
  imgBox: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 32 },
  name: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase', textAlign: 'center' },
  deleteBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.redBurgundy, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW },
  deleteBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 15 },
  addBtn: { position: 'absolute', bottom: 20, right: 20, backgroundColor: COLORS.navyBlue, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, ...CARD_SHADOW },
  addBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase' },
});
