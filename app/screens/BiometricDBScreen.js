// app/screens/BiometricDBScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, ScrollView, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllBiometricCards, deleteBiometricCard, getAllUsers, deleteUser } from '../database/userQueries';
import { getTransactionsByUser } from '../database/roomQueries';
import { COLORS, SHADOWS } from '../theme/theme';
import TransactionCard from '../components/TransactionCard';

const BiometricDBScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [showDetail, setShowDetail] = useState(false);

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  const load = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const openProfile = async (user) => {
    setSelectedUser(user);
    const txs = await getTransactionsByUser(user.id);
    setUserTransactions(txs);
    setShowDetail(true);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Supprimer le profil',
      `Supprimer définitivement le profil de ${user.first_name} ${user.last_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          await deleteUser(user.id);
          setShowDetail(false);
          load();
        }},
      ]
    );
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.profileCard} onPress={() => openProfile(item)} activeOpacity={0.8}>
      <View style={styles.avatarBox}>
        {item.profile_photo ? (
          <Image source={{ uri: item.profile_photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {item.first_name[0]}{item.last_name[0]}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.profileName}>{item.first_name}</Text>
      <Text style={styles.profileLastName}>{item.last_name}</Text>
      <Text style={styles.profileFiliere} numberOfLines={1}>{item.filiere || '—'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>BASE BIOMÉTRIQUE ({users.length})</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUser}
        numColumns={5}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun profil enregistré</Text>
          </View>
        }
      />

      {/* MODAL DÉTAIL PROFIL */}
      <Modal visible={showDetail} transparent animationType="slide">
        <View style={styles.detailOverlay}>
          <View style={styles.detailBox}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDetail(false)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.detailAvatarBox}>
                  {selectedUser.profile_photo ? (
                    <Image source={{ uri: selectedUser.profile_photo }} style={styles.detailAvatar} />
                  ) : (
                    <View style={[styles.detailAvatar, styles.avatarFallback]}>
                      <Text style={[styles.avatarInitials, { fontSize: 40 }]}>
                        {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.detailName}>{selectedUser.first_name} {selectedUser.last_name}</Text>

                <View style={styles.infoGrid}>
                  <InfoRow label="FILIÈRE" value={selectedUser.filiere || '—'} />
                  <InfoRow label="TÉLÉPHONE" value={selectedUser.phone || '—'} />
                  <InfoRow label="EMAIL" value={selectedUser.email || '—'} />
                  <InfoRow label="MOT DE PASSE" value={selectedUser.password} sensitive />
                  <InfoRow label="INSCRIT LE" value={new Date(selectedUser.created_at).toLocaleDateString('fr-FR')} />
                  <InfoRow label="TRANSACTIONS" value={`${userTransactions.length} prise(s)`} />
                </View>

                <Text style={styles.sectionTitle}>HISTORIQUE</Text>
                {userTransactions.map(tx => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}

                <TouchableOpacity
                  style={styles.deleteUserBtn}
                  onPress={() => handleDeleteUser(selectedUser)}
                >
                  <Text style={styles.deleteUserBtnText}>🗑️ SUPPRIMER CE PROFIL</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({ label, value, sensitive }) => {
  const [shown, setShown] = useState(!sensitive);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TouchableOpacity onPress={() => sensitive && setShown(!shown)}>
        <Text style={styles.infoValue}>{sensitive && !shown ? '••••••' : value}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
    ...SHADOWS.pill,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  profileCard: {
    flex: 1,
    maxWidth: '20%',
    margin: 8,
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
    ...SHADOWS.card,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    marginBottom: 8,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  profileName: { color: COLORS.white, fontSize: 11, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', textAlign: 'center' },
  profileLastName: { color: COLORS.grayMid, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  profileFiliere: { color: '#6B7280', fontSize: 9, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.grayMid, fontStyle: 'italic', fontSize: 15 },
  // Detail modal
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailBox: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    width: '80%',
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: { fontSize: 16, fontWeight: '900', color: '#555' },
  detailAvatarBox: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  detailAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.navyBlue },
  detailName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoGrid: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '800', color: COLORS.grayMid, textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.black, fontStyle: 'italic' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  deleteUserBtn: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteUserBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});

export default BiometricDBScreen;
