// app/screens/UserProfileScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Alert, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getUserById, updateUser } from '../database/userQueries';
import { getTransactionsByUser } from '../database/roomQueries';
import { getAllMaterials } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function UserProfileScreen({ navigation, route }) {
  const { userId, room } = route.params;
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showIdModal, setShowIdModal] = useState(false);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [userId]));

  const loadData = async () => {
    const u = await getUserById(userId);
    const t = await getTransactionsByUser(userId);
    const m = await getAllMaterials();
    setUser(u);
    setTransactions(t);
    setMaterials(m);
  };

  const addIdPhoto = async (source) => {
    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [4, 3] });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [4, 3] });
    }
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await updateUser(userId, { id_photo: uri });
      setUser(u => ({ ...u, id_photo: uri }));
    }
    setShowIdModal(false);
  };

  const getMaterialNames = (materialIds) => {
    try {
      const ids = JSON.parse(materialIds || '[]');
      return ids.map(id => materials.find(m => m.id === id)?.name).filter(Boolean).join(', ') || '—';
    } catch { return '—'; }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PillHeader title="Profil utilisateur" />

      {/* ── Carte profil ── */}
      <View style={styles.profileCard}>
        {/* Photo de profil */}
        <View style={styles.avatarWrap}>
          {user.profile_photo
            ? <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
            : <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>{(user.first_name[0]||'')+(user.last_name[0]||'')}</Text>
              </View>
          }
        </View>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userFiliere}>{user.filiere || '—'}</Text>
        {user.phone ? <Text style={styles.userMeta}>📞 {user.phone}</Text> : null}
        {user.email ? <Text style={styles.userMeta}>✉️ {user.email}</Text> : null}
      </View>

      {/* ── Photo document d'identité ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PIÈCE D'IDENTITÉ / CARTE ÉTUDIANTE</Text>
        {user.id_photo ? (
          <TouchableOpacity onPress={() => setShowIdModal(true)} activeOpacity={0.9}>
            <Image source={{ uri: user.id_photo }} style={styles.idPhoto} resizeMode="cover" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.idEmpty} onPress={() => setShowIdModal(true)}>
            <Text style={styles.idEmptyIcon}>🪪</Text>
            <Text style={styles.idEmptyText}>Ajouter la photo de la carte</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Boutons action ── */}
      {room && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RoomProfile', { room, user })}>
            <Text style={styles.actionBtnText}>🚪 ACCÉDER À LA SALLE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Historique ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HISTORIQUE DES TRANSACTIONS</Text>
        {transactions.length === 0
          ? <Text style={styles.noHistory}>Aucune transaction</Text>
          : transactions.map(t => (
            <View key={t.id} style={styles.txCard}>
              <View style={styles.txHeader}>
                <Text style={styles.txRoom}>{t.room_name}</Text>
                <View style={[styles.txStatus, { backgroundColor: t.status === 'returned' ? COLORS.statusReturned : COLORS.statusTaken }]}>
                  <Text style={styles.txStatusText}>{t.status === 'returned' ? 'RENDU' : 'EN COURS'}</Text>
                </View>
              </View>
              <Text style={styles.txTime}>{t.start_time} – {t.end_time}</Text>
              <Text style={styles.txMats}>{getMaterialNames(t.material_ids)}</Text>
            </View>
          ))
        }
      </View>

      {/* Modal choix source photo ID */}
      <Modal visible={showIdModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajouter la photo</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => addIdPhoto('camera')}>
              <Text style={styles.modalBtnText}>📸 Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => addIdPhoto('gallery')}>
              <Text style={styles.modalBtnText}>🖼️ Choisir depuis la galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowIdModal(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    alignItems: 'center', marginBottom: 20, borderWidth: 2,
    borderColor: COLORS.navyBlue, ...CARD_SHADOW,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.navyBlue },
  avatarFallback: { backgroundColor: COLORS.navyBlue, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 36, fontFamily: 'serif', fontWeight: '800' },
  userName: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 20, color: COLORS.navyBlue, textTransform: 'uppercase', textAlign: 'center' },
  userFiliere: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 13, marginTop: 4, textAlign: 'center' },
  userMeta: { fontFamily: 'serif', fontStyle: 'italic', color: '#444', fontSize: 12, marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 13, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  idPhoto: { width: '100%', height: 160, borderRadius: 16, borderWidth: 2, borderColor: COLORS.navyBlue, ...CARD_SHADOW },
  idEmpty: {
    width: '100%', height: 130, borderRadius: 16, borderWidth: 2.5,
    borderColor: COLORS.navyBlue, borderStyle: 'dashed',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    gap: 8, ...CARD_SHADOW,
  },
  idEmptyIcon: { fontSize: 36 },
  idEmptyText: { fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 13, textTransform: 'uppercase' },
  actionRow: { marginBottom: 20, alignItems: 'center' },
  actionBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 14, ...CARD_SHADOW },
  actionBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase' },
  noHistory: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 14, textAlign: 'center' },
  txCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.pinkBorder, ...CARD_SHADOW },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  txRoom: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 14, textTransform: 'uppercase' },
  txStatus: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  txStatusText: { color: '#fff', fontSize: 10, fontFamily: 'serif', fontWeight: '800' },
  txTime: { fontFamily: 'serif', fontStyle: 'italic', color: '#444', fontSize: 12, marginBottom: 4 },
  txMats: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: 320, alignItems: 'center', gap: 12, ...CARD_SHADOW },
  modalTitle: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 17, textTransform: 'uppercase', marginBottom: 4 },
  modalBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase' },
  cancelText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', marginTop: 4 },
});
