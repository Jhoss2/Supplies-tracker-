// app/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Alert, TextInput, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import RoomButton from '../components/RoomButton';
import { getAllRooms, getRoomByName } from '../database/roomQueries';
import { verifyAdminPassword, getSetting } from '../database/settingsQueries';
import { COLORS } from '../theme/theme';
import * as ScreenOrientation from 'expo-screen-orientation';

const ROOMS_ROW1 = ['TOUR DU SAVOIR', 'TOGUYENI', 'SALLE 15', 'SALLE 05'];
const ROOMS_ROW2 = [
  'SALLE 04', 'SALLE 06', 'SALLE 07', 'SALLE 16', 'SALLE 17',
  'SALLE 18', 'SALLE 19', 'SALLE 21', 'SALLE 22', 'SALLE 23',
  'SALLE 26', 'SALLE 27', 'LAB B ROOM 3', 'LAB ROOM 1',
  'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.1', 'AMPHI R.2.A'
];
const ROOMS_ROW3 = ['AMPHI R.2.B', 'AMPHI R.2.C', 'AMPHI R.2.D', 'AMPHI R.4'];
const ROOMS_ROW4 = ['AMPHI R.0'];

const HomeScreen = ({ navigation }) => {
  const { backgroundImage, refreshRooms } = useApp();
  const [roomsMap, setRoomsMap] = useState({});
  const [showPassModal, setShowPassModal] = useState(false);
  const [password, setPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    const data = await getAllRooms();
    const map = {};
    data.forEach(r => { map[r.name] = r; });
    setRoomsMap(map);
  };

  const handleRoomPress = async (roomName) => {
    const room = roomsMap[roomName];
    if (!room) return;
    navigation.navigate('Identification', { room });
  };

  const handleAdminAccess = async () => {
    const ok = await verifyAdminPassword(password);
    if (ok) {
      setShowPassModal(false);
      setPassword('');
      navigation.navigate('Settings');
    } else {
      Alert.alert('Accès refusé', 'Mot de passe incorrect');
    }
  };

  const renderRow = (rooms, columns) => (
    <View style={[styles.row, { marginBottom: 8 }]}>
      {rooms.map(name => (
        <View key={name} style={{ flex: 1, marginHorizontal: 3 }}>
          <RoomButton
            text={name}
            isOccupied={roomsMap[name]?.is_occupied === 1}
            onPress={() => handleRoomPress(name)}
          />
        </View>
      ))}
    </View>
  );

  const BgWrapper = ({ children }) => {
    if (backgroundImage) {
      return (
        <ImageBackground source={{ uri: backgroundImage }} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay}>{children}</View>
        </ImageBackground>
      );
    }
    return <View style={[styles.bg, { backgroundColor: '#111' }]}>{children}</View>;
  };

  return (
    <BgWrapper>
      {/* BOUTON ADMIN INVISIBLE — coin haut gauche */}
      <TouchableOpacity
        style={styles.invisibleAdmin}
        onPress={() => setShowPassModal(true)}
        activeOpacity={1}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderRow(ROOMS_ROW1, 4)}
        {renderRow(ROOMS_ROW2, 9)}
        {renderRow(ROOMS_ROW3, 4)}
        {renderRow(ROOMS_ROW4, 1)}
      </ScrollView>

      {/* MODAL ADMIN */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Accès Administrateur</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoFocus
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleAdminAccess}
              placeholder="MOT DE PASSE"
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => { setShowPassModal(false); setPassword(''); }}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.validateBtn} onPress={handleAdminAccess}>
                <Text style={styles.validateText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BgWrapper>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  invisibleAdmin: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 99,
    opacity: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#1C1C1C',
    borderRadius: 28,
    padding: 32,
    width: 360,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: COLORS.white,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelText: {
    color: '#777',
    fontWeight: '800',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    fontSize: 14,
  },
  validateBtn: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  validateText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    fontSize: 15,
  },
});

export default HomeScreen;
