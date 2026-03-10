// app/screens/RoomProfileScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRoomByName, getActiveTransactionByRoom, freeRoom } from '../database/roomQueries';
import { verifyAdminPassword } from '../database/settingsQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function RoomProfileScreen({ navigation, route }) {
  const { room: initialRoom, user } = route.params;
  const [room, setRoom] = useState(initialRoom);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerPass, setManagerPass] = useState('');

  useFocusEffect(useCallback(() => {
    loadRoom();
  }, []));

  const loadRoom = async () => {
    const r = await getRoomByName(initialRoom.name);
    setRoom(r);
    if (r?.is_occupied) {
      const tx = await getActiveTransactionByRoom(r.id);
      setActiveTransaction(tx);
    }
  };

  const handleManagerRelease = async () => {
    const ok = await verifyAdminPassword(managerPass);
    if (!ok) return Alert.alert('Accès refusé', 'Mot de passe incorrect.');
    Alert.alert('Libérer la salle', 'Confirmer la libération sans signature ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Libérer', style: 'destructive',
        onPress: async () => {
          await freeRoom(room.id);
          setShowManagerModal(false); setManagerPass('');
          Alert.alert('Salle libérée', 'La salle a été libérée manuellement.');
          loadRoom();
        }
      }
    ]);
  };

  const ActionBtn = ({ label, emoji, onPress, disabled, color }) => (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: disabled ? '#ccc' : (color || COLORS.navyBlue) }, disabled && styles.disabledBtn]}
      onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={styles.actionBtnText}>{emoji}  {label}</Text>
    </TouchableOpacity>
  );

  const isOccupied = room?.is_occupied === 1;

  return (
    <WallpaperBg>
      {/* Bouton manager invisible haut droite */}
      <TouchableOpacity style={styles.invisibleManager} onPress={() => setShowManagerModal(true)} activeOpacity={1} />

      <PillHeader title={room?.name || 'Salle'} />

      {isOccupied && (
        <View style={styles.occupiedBanner}>
          <Text style={styles.occupiedText}>⚠️ SALLE OCCUPÉE — {activeTransaction?.first_name} {activeTransaction?.last_name}</Text>
        </View>
      )}

      <View style={styles.btnGrid}>
        <ActionBtn
          emoji="📦" label="PRENDRE DU MATÉRIEL"
          disabled={isOccupied}
          onPress={() => navigation.navigate('MaterialSelection', { room, user, mode: 'take' })}
        />
        <ActionBtn
          emoji="➕" label="AJOUTER DU MATÉRIEL"
          disabled={!isOccupied || activeTransaction?.user_id !== user?.id}
          onPress={() => navigation.navigate('MaterialSelection', {
            room, user, mode: 'add',
            transactionId: activeTransaction?.id,
            existingMaterialIds: JSON.parse(activeTransaction?.material_ids || '[]'),
          })}
        />
        <ActionBtn
          emoji="📋" label="LISTE DU MATÉRIEL"
          disabled={!isOccupied || activeTransaction?.user_id !== user?.id}
          onPress={() => navigation.navigate('MaterialListTaken', { transaction: activeTransaction, room })}
        />
        <ActionBtn
          emoji="✅" label="REMETTRE LE MATÉRIEL"
          color={COLORS.redBurgundy}
          disabled={!isOccupied || activeTransaction?.user_id !== user?.id}
          onPress={() => navigation.navigate('SignatureReturn', { room, user, transaction: activeTransaction })}
        />
      </View>

      {/* Modal manager */}
      <Modal visible={showManagerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🔐 Accès Responsable Salle</Text>
            <TextInput
              style={styles.passInput} secureTextEntry autoFocus
              value={managerPass} onChangeText={setManagerPass}
              onSubmitEditing={handleManagerRelease}
              placeholder="MOT DE PASSE ADMIN" placeholderTextColor="#999"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => { setShowManagerModal(false); setManagerPass(''); }}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#B45309' }]} onPress={handleManagerRelease}>
                <Text style={styles.confirmBtnText}>⚡ LIBÉRER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  invisibleManager: { position: 'absolute', top: 0, right: 0, width: 60, height: 60, zIndex: 99, opacity: 0 },
  occupiedBanner: { backgroundColor: COLORS.redBurgundy, paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 20, marginBottom: 16, borderRadius: 14 },
  occupiedText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, textAlign: 'center', textTransform: 'uppercase' },
  btnGrid: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 40 },
  actionBtn: { width: '72%', borderRadius: 28, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', ...CARD_SHADOW },
  disabledBtn: { opacity: 0.45 },
  actionBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: 360, gap: 14, alignItems: 'center', ...CARD_SHADOW },
  modalTitle: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 17, textTransform: 'uppercase', textAlign: 'center' },
  passInput: { width: '100%', backgroundColor: 'transparent', color: '#000', borderRadius: 14, padding: 12, fontSize: 16, fontFamily: 'serif', fontWeight: '700', borderWidth: 1.5, borderColor: COLORS.pinkBorder },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  cancelText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  confirmBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  confirmBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
});
