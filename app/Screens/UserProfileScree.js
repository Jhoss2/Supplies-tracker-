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
import WallpaperBg from '../components/WallpaperBg';
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
      result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [85, 54] });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [85, 54] });
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
    <WallpaperBg>
      <PillHeader title="Profil utilisateur" />

      {/* Bouton (+) en haut à droite — mène à la sélection de matériel */}
      {room && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('RoomProfile', { room, user })}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Layout deux colonnes */}
      <View style={styles.twoCol}>

        {/* ── COLONNE GAUCHE : données personnelles ── */}
        <ScrollView style={styles.leftCol} contentContainerStyle={styles.leftContent} showsVerticalScrollIndicator={false}>

          {/* Avatar + nom */}
          <View style={styles.profileCard}>
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

          {/* Carte d'identité — format carte bancaire (ratio 85:54) */}
          <Text style={styles.sectionTitle}>PIÈCE D'IDENTITÉ / CARTE ÉTUDIANTE</Text>
          {user.id_photo ? (
            <TouchableOpacity onPress={() => setShowIdModal(true)} activeOpacity={0.9}>
              <Image source={{ uri: user.id_photo }} style={styles.idCard} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.idCardEmpty} onPress={() => setShowIdModal(true)}>
              <Text style={styles.idEmptyIcon}>🪪</Text>
              <Text style={styles.idEmptyText}>Ajouter la photo de la carte</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Séparateur vertical */}
        <View style={styles.divider} />

        {/* ── COLONNE DROITE : transactions ── */}
        <ScrollView style={styles.rightCol} contentContainerStyle={styles.rightContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>HISTORIQUE DES TRANSACTIONS</Text>
          {transactions.length === 0
            ? <Text style={styles.noHistory}>Aucune transaction</Text>
            : transactions.map(t => (
              <View key={t.id} style={styles.txCard}>
                <View style={styles.txHeader}>
                  <Text style={styles.txRoom}>{t.room_name}</Text>
                  <View style={[styles.txStatus, {
                    backgroundColor: t.status === 'returned' ? COLORS.statusReturned
                                   : t.status === 'validated' ? COLORS.statusValidated
                                   : COLORS.statusTaken
                  }]}>
                    <Text style={styles.txStatusText}>
                      {t.status === 'returned' ? 'RENDU' : t.status === 'validated' ? 'VALIDÉ' : 'EN COURS'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.txTime}>{t.start_time} – {t.end_time}</Text>
                <Text style={styles.txMats}>{getMaterialNames(t.material_ids)}</Text>
              </View>
            ))
          }
        </ScrollView>
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
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    position: 'absolute', top: 14, right: 20, zIndex: 50,
    backgroundColor: COLORS.green, width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW,
  },
  addBtnText: { color: '#fff', fontSize: 34, fontWeight: '900', lineHeight: 40 },

  twoCol: { flex: 1, flexDirection: 'row' },

  // Colonne gauche
  leftCol: { flex: 1 },
  leftContent: { padding: 20, paddingBottom: 40 },
  profileCard: {
    backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 20,
    alignItems: 'center', marginBottom: 24,
    borderWidth: 0, ...CARD_SHADOW,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.navyBlue },
  avatarFallback: { backgroundColor: COLORS.navyBlue, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 36, fontFamily: 'serif', fontWeight: '800' },
  userName: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 20, color: COLORS.navyBlue, textTransform: 'uppercase', textAlign: 'center' },
  userFiliere: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 14, marginTop: 4, textAlign: 'center' },
  userMeta: { fontFamily: 'serif', fontStyle: 'italic', color: '#444', fontSize: 13, marginTop: 4 },

  sectionTitle: {
    fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic',
    color: COLORS.navyBlue, fontSize: 14, textTransform: 'uppercase',
    marginBottom: 12, letterSpacing: 0.5,
  },

  // Carte d'identité — format carte bancaire (ratio ~1.585:1)
  idCard: {
    width: '100%',
    aspectRatio: 1.585,     // ratio carte bancaire / carte étudiant
    borderRadius: 14,       // légèrement arrondie comme une vraie carte
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
    ...CARD_SHADOW,
  },
  idCardEmpty: {
    width: '100%',
    aspectRatio: 1.585,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: COLORS.navyBlue,
    borderStyle: 'dashed',
    backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
    gap: 8, ...CARD_SHADOW,
  },
  idEmptyIcon: { fontSize: 40 },
  idEmptyText: { fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 14, textTransform: 'uppercase', textAlign: 'center', paddingHorizontal: 12 },

  // Séparateur
  divider: { width: 2, backgroundColor: 'rgba(0,0,0,0.12)', marginVertical: 20 },

  // Colonne droite
  rightCol: { flex: 1 },
  rightContent: { padding: 20, paddingBottom: 40 },
  noHistory: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 15, textAlign: 'center', marginTop: 20 },

  // Cartes transaction — style pill arrondi détaché
  txCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 28,     // pill arrondi
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,     // bien détachées
    ...CARD_SHADOW,
  },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  txRoom: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 15, textTransform: 'uppercase', flex: 1, marginRight: 8 },
  txStatus: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  txStatusText: { color: '#fff', fontSize: 11, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase' },
  txTime: { fontFamily: 'serif', fontStyle: 'italic', color: '#444', fontSize: 13, marginBottom: 4 },
  txMats: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: 320, alignItems: 'center', gap: 12, ...CARD_SHADOW },
  modalTitle: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 18, textTransform: 'uppercase', marginBottom: 4 },
  modalBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase' },
  cancelText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', marginTop: 4 },
});
