// app/screens/BiometricDBScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllBiometricCards, deleteBiometricCard } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function BiometricDBScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState(null);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => setCards(await getAllBiometricCards());

  const handleDelete = (card) => {
    Alert.alert('Supprimer', `Supprimer la carte de ${card.first_name} ${card.last_name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await deleteBiometricCard(card.id);
        setSelected(null);
        load();
      }}
    ]);
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
      {item.card_photo
        ? <Image source={{ uri: item.card_photo }} style={styles.cardImg} resizeMode="cover" />
        : <View style={[styles.cardImg, styles.cardImgFallback]}><Text style={styles.fallbackIcon}>🪪</Text></View>
      }
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.cardDate}>{item.created_at?.substring(0, 10) || '—'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PillHeader title="Base de données biométrique" />
      <Text style={styles.count}>{cards.length} carte{cards.length > 1 ? 's' : ''} enregistrée{cards.length > 1 ? 's' : ''}</Text>
      <FlatList
        data={cards}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        renderItem={renderCard}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune carte enregistrée</Text>
          </View>
        }
      />

      {/* Modal détail */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selected?.card_photo && (
              <Image source={{ uri: selected.card_photo }} style={styles.modalImg} resizeMode="cover" />
            )}
            <Text style={styles.modalName}>{selected?.first_name} {selected?.last_name}</Text>
            <Text style={styles.modalDate}>Enregistré le {selected?.created_at?.substring(0, 10)}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.closeText}>Fermer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selected)}>
                <Text style={styles.deleteBtnText}>🗑 Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  count: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 13, marginBottom: 8 },
  grid: { paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    flex: 1, maxWidth: '33%', margin: 8, backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden', borderWidth: 2,
    borderColor: COLORS.navyBlue, ...CARD_SHADOW,
  },
  cardImg: { width: '100%', height: 120 },
  cardImgFallback: { backgroundColor: COLORS.pinkBg, alignItems: 'center', justifyContent: 'center' },
  fallbackIcon: { fontSize: 40 },
  cardInfo: { padding: 10 },
  cardName: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 12, textTransform: 'uppercase' },
  cardDate: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 10, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: 340, alignItems: 'center', ...CARD_SHADOW },
  modalImg: { width: '100%', height: 180, borderRadius: 16, marginBottom: 14 },
  modalName: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 17, textTransform: 'uppercase', marginBottom: 4 },
  modalDate: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 12, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  closeText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  deleteBtn: { backgroundColor: COLORS.redBurgundy, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  deleteBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', fontSize: 13 },
});
