// app/screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateAdminPassword } from '../database/settingsQueries';
import { COLORS, CARD_SHADOW } from '../theme/theme';
import { useApp } from '../context/AppContext';
import PillHeader from '../components/PillHeader';

export default function SettingsScreen({ navigation }) {
  const { setBackgroundImage } = useApp();
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSetWallpaper = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) {
      setBackgroundImage(result.assets[0].uri);
      Alert.alert('Fond d\'écran', 'Fond d\'écran mis à jour !');
    }
  };

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 4) return Alert.alert('Erreur', 'Mot de passe trop court (min 4 caractères)');
    if (newPass !== confirmPass) return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
    await updateAdminPassword(newPass);
    setShowPassModal(false); setNewPass(''); setConfirmPass('');
    Alert.alert('Succès', 'Mot de passe administrateur mis à jour.');
  };

  const PillBtn = ({ label, emoji, onPress }) => (
    <TouchableOpacity style={styles.pillBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.pillBtnText}>{emoji}  {label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PillHeader title="Panneau d'administration" />
      <ScrollView contentContainerStyle={styles.content}>
        <PillBtn emoji="🖼️" label="DÉFINIR LE FOND D'ÉCRAN D'ACCUEIL" onPress={handleSetWallpaper} />
        <PillBtn emoji="➕" label="AJOUTER UN NOUVEAU MATÉRIEL" onPress={() => navigation.navigate('AddMaterial')} />
        <PillBtn emoji="📋" label="LISTE DU MATÉRIEL ENREGISTRÉ" onPress={() => navigation.navigate('MaterialInventory')} />
        <PillBtn emoji="🗃️" label="BASE DE DONNÉES BIOMÉTRIQUES" onPress={() => navigation.navigate('BiometricDB')} />
        <PillBtn emoji="👥" label="PROFILS INCOMPLETS" onPress={() => navigation.navigate('IncompleteProfiles')} />
        <PillBtn emoji="📊" label="HISTORIQUE DES TRANSACTIONS" onPress={() => navigation.navigate('TransactionHistory')} />
        <PillBtn emoji="🔐" label="MODIFIER LE MOT DE PASSE ADMIN" onPress={() => setShowPassModal(true)} />
      </ScrollView>

      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouveau mot de passe</Text>
            <TextInput style={styles.input} placeholder="NOUVEAU MOT DE PASSE" placeholderTextColor="#999" value={newPass} onChangeText={setNewPass} secureTextEntry autoFocus />
            <TextInput style={styles.input} placeholder="CONFIRMER" placeholderTextColor="#999" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 40, paddingBottom: 40, gap: 14, alignItems: 'center' },
  pillBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 36, width: '75%', alignItems: 'center', ...CARD_SHADOW },
  pillBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: 380, gap: 12, ...CARD_SHADOW },
  modalTitle: { fontSize: 18, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#000', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 },
  input: { backgroundColor: COLORS.pinkBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: 'serif', fontWeight: '700', color: '#000', borderWidth: 1.5, borderColor: COLORS.pinkBorder },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cancelText: { color: '#999', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
  saveBtn: { backgroundColor: COLORS.navyBlue, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' },
});
