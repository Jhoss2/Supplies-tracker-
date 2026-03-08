// app/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getSetting, updateAdminPassword } from '../database/settingsQueries';
import { COLORS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const SettingsScreen = ({ navigation }) => {
  const { setBackgroundImage } = useApp();
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSetWallpaper = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled) {
      setBackgroundImage(result.assets[0].uri);
      Alert.alert('Fond d\'écran', 'Fond d\'écran mis à jour !');
    }
  };

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 4) {
      Alert.alert('Erreur', 'Mot de passe trop court (min 4 caractères)');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    await updateAdminPassword(newPass);
    setShowPassModal(false);
    setNewPass(''); setConfirmPass('');
    Alert.alert('Succès', 'Mot de passe administrateur mis à jour.');
  };

  const PillButton = ({ label, onPress, emoji }) => (
    <TouchableOpacity style={styles.pillBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.pillBtnText}>{emoji}  {label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>PANNEAU D'ADMINISTRATION</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PillButton
          emoji="🖼️"
          label="DÉFINIR LE FOND D'ÉCRAN D'ACCUEIL"
          onPress={handleSetWallpaper}
        />
        <PillButton
          emoji="➕"
          label="AJOUTER UN NOUVEAU MATÉRIEL"
          onPress={() => navigation.navigate('AddMaterial')}
        />
        <PillButton
          emoji="📋"
          label="AFFICHER LA LISTE DU MATÉRIEL ENREGISTRÉ"
          onPress={() => navigation.navigate('MaterialInventory')}
        />
        <PillButton
          emoji="🗃️"
          label="BASE DE DONNÉES BIOMÉTRIQUES"
          onPress={() => navigation.navigate('BiometricDB')}
        />
        <PillButton
          emoji="🔐"
          label="MODIFIER LE MOT DE PASSE ADMINISTRATEUR"
          onPress={() => setShowPassModal(true)}
        />
      </ScrollView>

      {/* MODAL CHANGEMENT MOT DE PASSE */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouveau mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="NOUVEAU MOT DE PASSE"
              placeholderTextColor="#999"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="CONFIRMER"
              placeholderTextColor="#999"
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => { setShowPassModal(false); setNewPass(''); setConfirmPass(''); }}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 20,
    ...SHADOWS.pill,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center',
  },
  pillBtn: {
    backgroundColor: COLORS.navyBlue,
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 36,
    width: '70%',
    alignItems: 'center',
    ...SHADOWS.pill,
  },
  pillBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 28,
    width: 380,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontStyle: 'italic',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: { color: '#777', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  saveBtn: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
  },
  saveBtnText: { color: COLORS.white, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
});

export default SettingsScreen;
