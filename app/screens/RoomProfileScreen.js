// app/screens/RoomProfileScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveTransactionByRoom, validateTransactionByManager } from '../database/roomQueries';
import { freeRoom } from '../database/roomQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const RoomProfileScreen = ({ navigation, route }) => {
  const { room, user } = route.params;
  const { setCurrentTransaction, refreshRooms } = useApp();
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [])
  );

  const loadTransaction = async () => {
    const tx = await getActiveTransactionByRoom(room.id);
    setActiveTransaction(tx);
    if (tx) setCurrentTransaction(tx);
  };

  const isOccupied = !!activeTransaction;
  const canTake = !isOccupied;

  const handleTakeMaterial = () => {
    if (!canTake) {
      Alert.alert('Salle occupée', 'Un matériel est déjà en cours de prise. Vous pouvez uniquement ajouter du matériel.');
      return;
    }
    navigation.navigate('MaterialSelection', { room, user, mode: 'take' });
  };

  const handleAddMaterial = () => {
    if (!activeTransaction) {
      Alert.alert('Aucune transaction', 'Prenez d\'abord du matériel.');
      return;
    }
    navigation.navigate('MaterialSelection', {
      room, user, mode: 'add',
      transactionId: activeTransaction.id,
      existingMaterialIds: JSON.parse(activeTransaction.material_ids || '[]'),
    });
  };

  const handleListMaterial = () => {
    if (!activeTransaction) {
      Alert.alert('Aucune transaction', 'Aucun matériel en cours.');
      return;
    }
    navigation.navigate('MaterialListTaken', {
      materialIds: JSON.parse(activeTransaction.material_ids || '[]'),
    });
  };

  const handleSignReturn = () => {
    if (!activeTransaction) {
      Alert.alert('Aucune transaction', 'Aucun matériel en cours.');
      return;
    }
    navigation.navigate('SignatureReturn', {
      transaction: activeTransaction,
      room,
    });
  };

  const handleManagerRelease = async () => {
    setShowReleaseConfirm(false);
    if (activeTransaction) {
      await validateTransactionByManager(activeTransaction.id);
    }
    await freeRoom(room.id);
    await refreshRooms();
    navigation.navigate('Home');
  };

  const ActionBtn = ({ emoji, label, onPress, disabled, color }) => (
    <TouchableOpacity
      style={[styles.actionBtn, disabled && styles.disabledBtn, color && { borderColor: color }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={[styles.actionLabel, disabled && { color: '#666' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* BOUTON GESTIONNAIRE INVISIBLE */}
      <TouchableOpacity
        style={styles.invisibleManager}
        onPress={() => setShowReleaseConfirm(true)}
        activeOpacity={1}
      />

      <PillHeader title={`Salle — ${room.name}`} />

      {isOccupied && (
        <View style={styles.occupiedBanner}>
          <Text style={styles.occupiedBannerText}>
            🔴 SALLE OCCUPÉE — {activeTransaction.first_name} {activeTransaction.last_name}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        <ActionBtn
          emoji="📦"
          label={`PRENDRE DU\nMATÉRIEL`}
          onPress={handleTakeMaterial}
          disabled={!canTake}
          color={canTake ? COLORS.navyBlue : '#444'}
        />
        <ActionBtn
          emoji="➕"
          label={`AJOUTER DU\nMATÉRIEL`}
          onPress={handleAddMaterial}
          disabled={!isOccupied}
          color={isOccupied ? COLORS.navyBlue : '#444'}
        />
        <ActionBtn
          emoji="📋"
          label={`LISTE DU\nMATÉRIEL PRIS`}
          onPress={handleListMaterial}
          disabled={!isOccupied}
          color={isOccupied ? COLORS.navyBlue : '#444'}
        />
        <ActionBtn
          emoji="✍️"
          label={`SIGNATURE\nDE REMISE`}
          onPress={handleSignReturn}
          disabled={!isOccupied}
          color={isOccupied ? COLORS.redBurgundy : '#444'}
        />
      </View>

      {/* MODAL LIBÉRATION DE SALLE */}
      <Modal visible={showReleaseConfirm} transparent animationType="fade">
        <View style={styles.releaseOverlay}>
          <TouchableOpacity
            style={styles.releaseBtn}
            onPress={handleManagerRelease}
            activeOpacity={0.85}
          >
            <Text style={styles.releaseBtnText}>OK</Text>
            <Text style={styles.releaseSubText}>Libérer la salle (Gestionnaire)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.releaseCancelBtn} onPress={() => setShowReleaseConfirm(false)}>
            <Text style={styles.releaseCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  invisibleManager: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    zIndex: 99,
    opacity: 0,
  },
  occupiedBanner: {
    backgroundColor: COLORS.redBurgundy,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  occupiedBannerText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  actionBtn: {
    width: 160,
    height: 160,
    backgroundColor: '#1C1C1C',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    ...SHADOWS.card,
  },
  disabledBtn: {
    backgroundColor: '#111',
    borderColor: '#333',
  },
  actionEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Release modal
  releaseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  releaseBtn: {
    backgroundColor: '#F97316',
    width: 200,
    height: 200,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  releaseBtnText: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  releaseSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  releaseCancelBtn: { padding: 12 },
  releaseCancelText: { color: '#777', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
});

export default RoomProfileScreen;
