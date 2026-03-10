// app/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Alert, TextInput, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import RoomButton from '../components/RoomButton';
import { getAllRooms } from '../database/roomQueries';
import { verifyAdminPassword } from '../database/settingsQueries';
import * as ScreenOrientation from 'expo-screen-orientation';

const ROOMS_ROW1 = ['TOUR DU SAVOIR', 'TOGUYENI', 'SALLE 15', 'SALLE 05'];
const ROOMS_ROW2 = [
  'SALLE 04','SALLE 06','SALLE 07','SALLE 16','SALLE 17',
  'SALLE 18','SALLE 19','SALLE 21','SALLE 22','SALLE 23',
  'SALLE 26','SALLE 27','LAB B ROOM 3','LAB ROOM 1',
  'LAB ROOM 2','LAB ROOM 3','AMPHI R.1','AMPHI R.2.A'
];
const ROOMS_ROW3 = ['AMPHI R.2.B','AMPHI R.2.C','AMPHI R.2.D','AMPHI R.4'];
const ROOMS_ROW4 = ['AMPHI R.0'];

export default function HomeScreen({ navigation }) {
  const { backgroundImage } = useApp();
  const [roomsMap, setRoomsMap] = useState({});
  const [showPassModal, setShowPassModal] = useState(false);
  const [password, setPassword] = useState('');

  useFocusEffect(useCallback(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    loadRooms();
  }, []));

  const loadRooms = async () => {
    const data = await getAllRooms();
    const map = {};
    data.forEach(r => { map[r.name] = r; });
    setRoomsMap(map);
  };

  const handleRoomPress = (roomName) => {
    const room = roomsMap[roomName];
    if (!room) return;
    // Aller directement à la liste des profils
    navigation.navigate('UserProfileList', { room });
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

  const renderRow = (rooms) => (
    <View style={styles.row}>
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

  const BgWrapper = ({ children }) => backgroundImage ? (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  ) : (
    <View style={[styles.bg, { backgroundColor: '#111' }]}>{children}</View>
  );

  return (
    <BgWrapper>
      {/* Bouton admin invisible */}
      <TouchableOpacity style={styles.invisibleAdmin} onPress={() => setShowPassModal(true)} activeOpacity={1} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.rowWrap}>{renderRow(ROOMS_ROW1)}</View>
        <View style={styles.rowWrap}>{renderRow(ROOMS_ROW2)}</View>
        <View style={styles.rowWrap}>{renderRow(ROOMS_ROW3)}</View>
        <View style={[styles.rowWrap, { justifyContent: 'center' }]}>
          <View style={{ width: 120 }}>
            <RoomButton text="AMPHI R.0" isOccupied={roomsMap['AMPHI R.0']?.is_occupied === 1} onPress={() => handleRoomPress('AMPHI R.0')} />
          </View>
        </View>
      </ScrollView>

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
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  invisibleAdmin: { position: 'absolute', top: 0, left: 0, width: 60, height: 60, zIndex: 99, opacity: 0 },
  content: { paddingHorizontal: 12, paddingVertical: 16, flexGrow: 1, justifyContent: 'center' },
  rowWrap: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#1C1C1C', borderRadius: 28, padding: 32, width: 360, borderWidth: 2, borderColor: '#fff' },
  modalTitle: { color: '#fff', fontSize: 17, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#2A2A2A', color: '#fff', borderRadius: 16, padding: 14, fontSize: 15, fontFamily: 'serif', fontWeight: '700', marginBottom: 20, borderWidth: 1, borderColor: '#444' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelText: { color: '#777', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', fontSize: 14 },
  validateBtn: { backgroundColor: '#0D2461', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  validateText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase', fontSize: 15 },
});
