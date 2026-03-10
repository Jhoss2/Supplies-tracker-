// app/screens/UserProfileListScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllUsers, verifyUserPassword } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function UserProfileListScreen({ navigation, route }) {
  const { room } = route.params || {};
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [password, setPassword] = useState('');

  useFocusEffect(useCallback(() => { loadUsers(); }, []));

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const promptPassword = (user) => {
    setSelectedUser(user);
    setPassword('');
    setShowPassModal(true);
  };

  const handlePasswordConfirm = async () => {
    const ok = await verifyUserPassword(selectedUser.id, password);
    if (ok) {
      setShowPassModal(false);
      navigation.navigate('UserProfile', { userId: selectedUser.id, room });
    } else {
      Alert.alert('Mot de passe incorrect', 'Veuillez réessayer.');
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => promptPassword(item)} activeOpacity={0.8}>
      <View style={styles.avatarBox}>
        {item.profile_photo
          ? <Image source={{ uri: item.profile_photo }} style={styles.avatar} />
          : <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{(item.first_name[0]||'')+(item.last_name[0]||'')}</Text>
            </View>
        }
      </View>
      <Text style={styles.userName} numberOfLines={1}>{item.first_name}</Text>
      <Text style={styles.userLastName} numberOfLines={1}>{item.last_name}</Text>
    </TouchableOpacity>
  );

  return (
    <WallpaperBg>
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

      {/* FAB + */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateProfile', { room })} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal mot de passe */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedUser?.profile_photo
              ? <Image source={{ uri: selectedUser.profile_photo }} style={styles.modalAvatar} />
              : <View style={[styles.modalAvatar, styles.avatarFallback]}>
                  <Text style={[styles.avatarInitials, { fontSize: 32 }]}>
                    {(selectedUser?.first_name[0]||'')+(selectedUser?.last_name[0]||'')}
                  </Text>
                </View>
            }
            <Text style={styles.modalName}>{selectedUser?.first_name} {selectedUser?.last_name}</Text>
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
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  list: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },
  userCard: {
    flex: 1, maxWidth: '20%', margin: 10, alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20, padding: 14,
    borderWidth: 2, borderColor: COLORS.navyBlue, ...CARD_SHADOW,
  },
  avatarBox: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginBottom: 8, borderWidth: 3, borderColor: COLORS.navyBlue },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: { width: '100%', height: '100%', backgroundColor: COLORS.navyBlue, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontSize: 26, fontFamily: 'serif', fontWeight: '800' },
  userName: { color: COLORS.navyBlue, fontSize: 16, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', textAlign: 'center' },
  userLastName: { color: COLORS.grayMid, fontSize: 16, fontFamily: 'serif', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 16 },
  emptySubText: { color: COLORS.grayMid, fontSize: 15, marginTop: 8, fontFamily: 'serif', fontStyle: 'italic' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 66, height: 66,
    borderRadius: 33, backgroundColor: COLORS.redBurgundy,
    alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW,
  },
  fabText: { color: '#fff', fontSize: 36, fontWeight: '900', lineHeight: 42 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center' },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28, width: 340,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.navyBlue, ...CARD_SHADOW,
  },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 3, borderColor: COLORS.navyBlue },
  modalName: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 16, textTransform: 'uppercase', marginBottom: 16 },
  passInput: { width: '100%', backgroundColor: 'transparent', color: '#000', borderRadius: 14, padding: 12, fontSize: 16, fontFamily: 'serif', fontWeight: '700', marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.pinkBorder },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  cancelText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  confirmBtn: { backgroundColor: COLORS.navyBlue, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 },
  confirmText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
});
