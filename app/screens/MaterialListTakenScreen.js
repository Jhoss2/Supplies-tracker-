// app/screens/MaterialListTakenScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getMaterialsByIds } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function MaterialListTakenScreen({ navigation, route }) {
  const { transaction, room } = route.params;
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (!transaction) return;
    try {
      const ids = JSON.parse(transaction.material_ids || '[]');
      getMaterialsByIds(ids).then(setMaterials);
    } catch (e) { setMaterials([]); }
  }, [transaction]);

  return (
    <View style={styles.container}>
      <PillHeader title="Matériel en cours d'utilisation" />
      <Text style={styles.roomName}>{room?.name}</Text>
      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>📦 {item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun matériel enregistré</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  roomName: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 15, marginBottom: 10, textTransform: 'uppercase' },
  list: { paddingHorizontal: 30, paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.pinkBorder, ...CARD_SHADOW },
  cardText: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, color: COLORS.navyBlue, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 14 },
  backBtn: { margin: 20, backgroundColor: COLORS.navyBlue, borderRadius: 24, padding: 14, alignItems: 'center', ...CARD_SHADOW },
  backBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase' },
});
