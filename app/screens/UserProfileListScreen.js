// app/screens/UserProfileListScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Alert, TextInput, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllUsers, verifyUserPassword } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';

const UserProfileListScreen = ({ navigation, route }) => {
  const { room, preSelectedUserId, manualData, cardPhoto, cardHash } = route.params || {};
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [password, setPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    if (preSelectedUserId) {
      const found = data.find(u => u.id === preSelectedUserId);
      if (found) promptPassword(found);
    }
  };

  const promptPassword = (user) => {
    setSelectedUser(user);
    setPassword('');
    setShowPassModal(true);
  };

  const handlePasswordConfirm = async () => {
    if (!selectedUser) return;
    const ok = await verifyUserPassword(selectedUser.id, password);
    if (ok) {
      setShowPassModal(false);
      navigation.navigate('UserProfile', { 
        userId: selectedUser.id, 
        room,
        cardPhoto,
        cardHash 
      });
    } else {
      Alert.alert('Mot de passe incorrect', 'Veuillez réessayer.');
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => promptPassword(item)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarBox}>
        {item.profile_photo ? (
          <Image source={{ uri: item.profile_photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {(item.first_name[0] || '') + (item.last_name[0] || '')}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.userName} numberOfLines={1}>{item.first_name}</Text>
      <Text style={styles.userLastName} numberOfLines={1}>{item.last_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PillHeader title="Sélectionner un profil" />

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUser}
        numColumns={5}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun profil enregistré</Text>
            <Text style={styles.emptySubText}>Ajoutez un profil avec le bouton "+"</Text>
          </View>
        }
      />

      {/* Bouton + flottant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProfile', { room, manualData, cardPhoto, cardHash })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal mot de passe */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedUser?.profile_photo ? (
              <Image source={{ uri: selectedUser.profile_photo }} style={styles.modalAvatar} />
            ) : (
              <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {(selectedUser?.first_name[0] || '') + (selectedUser?.last_name[0] || '')}
                </Text>
              </View>
            )}
            <Text style={styles.modalName}>
              {selectedUser?.first_name} {selectedUser?.last_name}
            </Text>
            <TextInput
              style={styles.passInput}
              secureTextEntry
              autoFocus
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handlePasswordConfirm}
              placeholder="MOT DE PASSE"
              placeholderTextColor="#999"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowPassModal(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handlePasswordConfirm}>
                <Text style={styles.confirmText}>Entrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  list: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },
  userCard: {
    flex: 1,
    maxWidth: '20%',
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
    ...SHADOWS.card,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  userName: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  userLastName: {
    color: COLORS.grayMid,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.white, fontSize: 16, fontWeight: '800', fontStyle: 'italic' },
  emptySubText: { color: COLORS.grayMid, fontSize: 13, marginTop: 8 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.redBurgundy,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(COLORS.redBurgundy),
    elevation: 14,
  },
  fabText: { color: COLORS.white, fontSize: 36, fontWeight: '900', lineHeight: 42 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#1C1C1C',
    borderRadius: 28,
    padding: 28,
    width: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
  },
  modalName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  passInput: {
    width: '100%',
    backgroundColor: '#2A2A2A',
    color: COLORS.white,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  cancelText: { color: '#777', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  confirmBtn: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
  },
  confirmText: { color: COLORS.white, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
});

export default UserProfileListScreen;
