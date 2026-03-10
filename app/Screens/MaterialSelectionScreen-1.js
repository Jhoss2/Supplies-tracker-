// app/screens/MaterialSelectionScreen.js
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

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
      <TouchableOpacity
        style={[styles.card, isSel && styles.cardSel, isLocked && styles.cardLocked]}
        onPress={() => toggle(item.id)}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        {/* Image prend la majorité de la carte */}
        <View style={styles.imgBox}>
          {item.image
            ? <Image source={{ uri: item.image }} style={styles.img} resizeMode="contain" />
            : <Text style={styles.imgFallback}>📦</Text>
          }
        </View>
        <Text style={[styles.cardName, isSel && styles.cardNameSel]} numberOfLines={2}>{item.name}</Text>
        {isSel && <View style={styles.checkDot}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text></View>}
      </TouchableOpacity>
    );
  };

  return (
    <WallpaperBg>
      <PillHeader title="Sélectionner le matériel" />
      <Text style={styles.subtitle}>SÉLECTIONNEZ UNIQUEMENT CE DONT VOUS AVEZ BESOIN</Text>

      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
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
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  subtitle: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 14, marginBottom: 16, letterSpacing: 0.5 },
  grid: { paddingHorizontal: 16, paddingBottom: 100 },
  colWrap: { justifyContent: 'center', marginBottom: 20 },

  // Cartes agrandies — 3 colonnes, image grande
  card: {
    width: 200, margin: 10, borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', padding: 12, ...CARD_SHADOW, position: 'relative',
  },
  cardSel: { borderWidth: 3, borderColor: COLORS.redBurgundy, backgroundColor: 'rgba(139,0,0,0.08)' },
  cardLocked: { opacity: 0.4 },

  // Image occupe la majorité de la carte
  imgBox: { width: 140, height: 130, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 },
  img: { width: '100%', height: '100%' },
  imgFallback: { fontSize: 50 },

  cardName: { fontSize: 14, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, textTransform: 'uppercase', textAlign: 'center', lineHeight: 18 },
  cardNameSel: { color: COLORS.redBurgundy },
  checkDot: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.redBurgundy, alignItems: 'center', justifyContent: 'center' },

  validateBtn: { position: 'absolute', bottom: 20, right: 24, backgroundColor: COLORS.redBurgundy, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 28, borderWidth: 2, borderColor: '#fff', ...CARD_SHADOW },
  validateBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 17, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontFamily: 'serif', fontStyle: 'italic', fontSize: 16 },

  timeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center' },
  timeBox: { backgroundColor: '#fff', borderRadius: 36, padding: 28, width: 500, alignItems: 'center', ...CARD_SHADOW },
  timeTitle: { fontSize: 21, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, textTransform: 'uppercase', marginBottom: 20 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  timeSep: { fontSize: 24, fontFamily: 'serif', fontWeight: '900', color: COLORS.navyBlue },
  timePreview: { backgroundColor: COLORS.grayLight, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 16 },
  timePreviewText: { fontSize: 22, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue },
  timeConfirmBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 24, paddingHorizontal: 48, paddingVertical: 14, ...CARD_SHADOW },
  timeConfirmText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 19, textTransform: 'uppercase' },
});

const tc = StyleSheet.create({
  col: { width: 160, alignItems: 'center' },
  label: { fontSize: 14, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, textTransform: 'uppercase', marginBottom: 8 },
  scroll: { height: 230, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: COLORS.grayBorder },
  item: { height: 46, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemSel: { backgroundColor: COLORS.navyBlue },
  itemText: { fontSize: 16, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#000' },
  itemTextSel: { color: '#fff' },
});
