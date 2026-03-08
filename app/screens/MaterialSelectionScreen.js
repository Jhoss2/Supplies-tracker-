// app/screens/MaterialSelectionScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Alert, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMaterials } from '../database/materialQueries';
import MaterialCard from '../components/MaterialCard';
import PillHeader from '../components/PillHeader';
import { COLORS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// Génère créneaux horaires de 07:30 à 21:30 par tranches de 30 min
const generateSlots = () => {
  const slots = [];
  for (let h = 7; h <= 21; h++) {
    slots.push(`${String(h).padStart(2,'0')}h 00`);
    slots.push(`${String(h).padStart(2,'0')}h 30`);
  }
  return slots;
};
const TIME_SLOTS = generateSlots();

const TimePickerColumn = ({ label, selected, onSelect }) => {
  const scrollRef = useRef(null);
  const ITEM_H = 44;

  const scrollToSelected = (index) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_H, animated: true });
  };

  return (
    <View style={styles.timeColumn}>
      <Text style={styles.timeColLabel}>{label}</Text>
      <ScrollView
        ref={scrollRef}
        style={styles.timeScroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
      >
        {TIME_SLOTS.map((slot, i) => (
          <TouchableOpacity
            key={slot}
            style={[styles.timeItem, selected === slot && styles.timeItemSelected]}
            onPress={() => { onSelect(slot); scrollToSelected(i); }}
          >
            <Text style={[styles.timeItemText, selected === slot && styles.timeItemTextSelected]}>
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const MaterialSelectionScreen = ({ navigation, route }) => {
  const { room, user, mode, transactionId, existingMaterialIds = [] } = route.params;
  const { refreshRooms } = useApp();
  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState(existingMaterialIds.map(id => parseInt(id)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [])
  );

  const loadMaterials = async () => {
    const data = await getAllMaterials();
    setMaterials(data);
  };

  const toggleMaterial = (id) => {
    if (mode === 'add' && existingMaterialIds.includes(id)) return; // non désélectionnable
    if (selected.includes(id)) {
      if (mode === 'add') return; // pas de désélection en mode ajout
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleValidate = () => {
    if (selected.length === 0) {
      Alert.alert('Sélection vide', 'Veuillez sélectionner au moins un matériel.');
      return;
    }
    setShowTimePicker(true);
  };

  const handleTimeConfirm = () => {
    if (!startTime || !endTime) {
      Alert.alert('Heure requise', 'Veuillez choisir l\'heure de début et de fin du cours.');
      return;
    }
    setShowTimePicker(false);
    navigation.navigate('SignatureFirst', {
      room, user, mode,
      selectedMaterialIds: selected,
      startTime, endTime,
      transactionId: transactionId || null,
    });
  };

  const isLocked = (id) => mode === 'add' && existingMaterialIds.includes(id);

  return (
    <View style={styles.container}>
      <PillHeader title="Sélectionner le matériel" />

      <FlatList
        data={materials}
        keyExtractor={item => item.id.toString()}
        numColumns={5}
        renderItem={({ item }) => (
          <View style={{ flex: 1, margin: 6, maxWidth: '20%' }}>
            <MaterialCard
              item={item}
              isSelected={selected.includes(item.id)}
              onPress={() => toggleMaterial(item.id)}
              disabled={isLocked(item.id)}
            />
          </View>
        )}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun matériel enregistré</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.validateBtn} onPress={handleValidate}>
        <Text style={styles.validateBtnText}>VALIDER ({selected.length})</Text>
      </TouchableOpacity>

      {/* TIME PICKER MODAL */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.timeModalOverlay}>
          <View style={styles.timeModalBox}>
            <Text style={styles.timeModalTitle}>HEURE DU COURS</Text>

            <View style={styles.timePickerRow}>
              <TimePickerColumn
                label="DÉBUT"
                selected={startTime}
                onSelect={setStartTime}
              />
              <Text style={styles.timeSeparator}>→</Text>
              <TimePickerColumn
                label="FIN"
                selected={endTime}
                onSelect={setEndTime}
              />
            </View>

            {startTime && endTime && (
              <View style={styles.timePreview}>
                <Text style={styles.timePreviewText}>{startTime} – {endTime}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.timeConfirmBtn} onPress={handleTimeConfirm}>
              <Text style={styles.timeConfirmBtnText}>OK ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  grid: { paddingHorizontal: 12, paddingBottom: 100, paddingTop: 4 },
  validateBtn: {
    position: 'absolute',
    bottom: 20,
    right: 24,
    backgroundColor: COLORS.redBurgundy,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.pill,
  },
  validateBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontSize: 15, fontStyle: 'italic' },
  // Time Picker
  timeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeModalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 36,
    padding: 28,
    width: 480,
    alignItems: 'center',
  },
  timeModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  timeColumn: { width: 150, alignItems: 'center' },
  timeColLabel: {
    fontSize: 13,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  timeScroll: {
    height: 220,
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timeItem: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeItemSelected: {
    backgroundColor: COLORS.navyBlue,
  },
  timeItemText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.black,
    fontStyle: 'italic',
  },
  timeItemTextSelected: {
    color: COLORS.white,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.navyBlue,
  },
  timePreview: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  timePreviewText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.navyBlue,
    fontStyle: 'italic',
  },
  timeConfirmBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 14,
    ...SHADOWS.pill,
  },
  timeConfirmBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 18,
    textTransform: 'uppercase',
  },
});

export default MaterialSelectionScreen;
