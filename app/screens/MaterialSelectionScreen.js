// app/screens/MaterialSelectionScreen.js
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';
import { useApp } from '../context/AppContext';

const TIME_SLOTS = [];
for (let h = 7; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2,'0')}h00`);
  TIME_SLOTS.push(`${String(h).padStart(2,'0')}h30`);
}

const TimeCol = ({ label, selected, onSelect }) => {
  const ITEM_H = 46;
  const scrollRef = useRef(null);
  return (
    <View style={tc.col}>
      <Text style={tc.label}>{label}</Text>
      <ScrollView ref={scrollRef} style={tc.scroll} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H} decelerationRate="fast">
        {TIME_SLOTS.map((slot, i) => (
          <TouchableOpacity key={slot} style={[tc.item, selected === slot && tc.itemSel]} onPress={() => { onSelect(slot); scrollRef.current?.scrollTo({ y: i * ITEM_H, animated: true }); }}>
            <Text style={[tc.itemText, selected === slot && tc.itemTextSel]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function MaterialSelectionScreen({ navigation, route }) {
  const { room, user, mode, transactionId, existingMaterialIds = [] } = route.params;
  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState(existingMaterialIds.map(id => parseInt(id)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useFocusEffect(useCallback(() => { getAllMaterials().then(setMaterials); }, []));

  const toggle = (id) => {
    if (mode === 'add' && existingMaterialIds.includes(id)) return;
    if (selected.includes(id)) {
      if (mode === 'add') return;
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleValidate = () => {
    if (selected.length === 0) return Alert.alert('Sélection vide', 'Sélectionnez au moins un matériel.');
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    if (!startTime || !endTime) return Alert.alert('Heure requise', 'Choisissez début et fin.');
    setShowTimePicker(false);
    navigation.navigate('SignatureFirst', { room, user, mode, selectedMaterialIds: selected, startTime, endTime, transactionId: transactionId || null });
  };

  const renderItem = ({ item }) => {
    const isSel = selected.includes(item.id);
    const isLocked = mode === 'add' && existingMaterialIds.includes(item.id);
    return (
      <TouchableOpacity style={[styles.card, isSel && styles.cardSel, isLocked && styles.cardLocked]} onPress={() => toggle(item.id)} disabled={isLocked} activeOpacity={0.8}>
        <View style={styles.imgBox}>
          {item.image ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" /> : <Text style={styles.imgFallback}>📦</Text>}
        </View>
        <Text style={[styles.cardName, isSel && styles.cardNameSel]} numberOfLines={2}>{item.name}</Text>
        {isSel && <View style={styles.checkDot}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>✓</Text></View>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PillHeader title="Sélectionner le matériel" />
      <Text style={styles.subtitle}>SÉLECTIONNEZ UNIQUEMENT CE DONT VOUS AVEZ BESOIN</Text>

      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={4}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.colWrap}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Aucun matériel enregistré</Text></View>}
      />

      <TouchableOpacity style={styles.validateBtn} onPress={handleValidate}>
        <Text style={styles.validateBtnText}>VALIDER ({selected.length})</Text>
      </TouchableOpacity>

      {/* TIME PICKER */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.timeOverlay}>
          <View style={styles.timeBox}>
            <Text style={styles.timeTitle}>HEURE DU COURS</Text>
            <View style={styles.timeRow}>
              <TimeCol label="DÉBUT" selected={startTime} onSelect={setStartTime} />
              <Text style={styles.timeSep}>→</Text>
              <TimeCol label="FIN" selected={endTime} onSelect={setEndTime} />
            </View>
            {startTime && endTime && (
              <View style={styles.timePreview}>
                <Text style={styles.timePreviewText}>{startTime} – {endTime}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.timeConfirmBtn} onPress={handleTimeConfirm}>
              <Text style={styles.timeConfirmText}>OK ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  subtitle: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 13, marginBottom: 12, letterSpacing: 0.5 },
  grid: { paddingHorizontal: 20, paddingBottom: 100 },
  colWrap: { justifyContent: 'center', marginBottom: 16 },
  card: {
    width: 140, margin: 8, borderRadius: 20, borderWidth: 3, borderColor: COLORS.navyBlue,
    backgroundColor: COLORS.navyBlue, alignItems: 'center', padding: 10, ...CARD_SHADOW, position: 'relative',
  },
  cardSel: { borderColor: COLORS.redBurgundy, backgroundColor: COLORS.selectedCard },
  cardLocked: { opacity: 0.5 },
  imgBox: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 36 },
  cardName: { fontSize: 11, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#fff', textTransform: 'uppercase', textAlign: 'center', lineHeight: 14 },
  cardNameSel: { color: COLORS.navyBlue },
  checkDot: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.redBurgundy, alignItems: 'center', justifyContent: 'center' },
  validateBtn: { position: 'absolute', bottom: 20, right: 24, backgroundColor: COLORS.redBurgundy, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 28, borderWidth: 2, borderColor: '#fff', ...CARD_SHADOW },
  validateBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontFamily: 'serif', fontStyle: 'italic', fontSize: 15 },
  timeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center' },
  timeBox: { backgroundColor: '#fff', borderRadius: 36, padding: 28, width: 500, alignItems: 'center', ...CARD_SHADOW },
  timeTitle: { fontSize: 20, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, textTransform: 'uppercase', marginBottom: 20 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  timeSep: { fontSize: 24, fontFamily: 'serif', fontWeight: '900', color: COLORS.navyBlue },
  timePreview: { backgroundColor: COLORS.pinkBg, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 16 },
  timePreviewText: { fontSize: 20, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue },
  timeConfirmBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 24, paddingHorizontal: 48, paddingVertical: 14, ...CARD_SHADOW },
  timeConfirmText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase' },
});

const tc = StyleSheet.create({
  col: { width: 160, alignItems: 'center' },
  label: { fontSize: 13, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, textTransform: 'uppercase', marginBottom: 8 },
  scroll: { height: 230, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: COLORS.pinkBorder },
  item: { height: 46, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemSel: { backgroundColor: COLORS.navyBlue },
  itemText: { fontSize: 15, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#000' },
  itemTextSel: { color: '#fff' },
});
