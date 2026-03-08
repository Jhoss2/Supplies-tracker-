// app/screens/CreateProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUser, saveBiometricCard } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';

const CreateProfileScreen = ({ navigation, route }) => {
  const { room, manualData, cardPhoto, cardHash } = route.params || {};

  const [firstName, setFirstName] = useState(manualData?.firstName || '');
  const [lastName, setLastName] = useState(manualData?.lastName || '');
  const [filiere, setFiliere] = useState(manualData?.filiere || '');
  const [phone, setPhone] = useState(manualData?.phone || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Champs requis', 'Prénom et nom sont obligatoires.');
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert('Mot de passe requis', 'Minimum 4 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSaving(true);
    try {
      const userId = await createUser({
        first_name: firstName.trim().toUpperCase(),
        last_name: lastName.trim().toUpperCase(),
        phone: phone.trim(),
        email: email.trim(),
        filiere: filiere.trim().toUpperCase(),
        password,
        profile_photo: profilePhoto,
        qr_code: null,
      });

      // Lier la carte biométrique scannée si présente
      if (cardPhoto && cardHash) {
        await saveBiometricCard({
          user_id: userId,
          card_photo: cardPhoto,
          scan_hash: cardHash,
          first_name_detected: firstName,
          last_name_detected: lastName,
        });
      }

      Alert.alert('Profil créé !', `Bienvenue ${firstName}.`, [
        { text: 'OK', onPress: () => navigation.navigate('UserProfile', { userId, room }) }
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PillHeader title="Créer un profil" />

      {/* Avatar */}
      <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>📷</Text>
            <Text style={styles.avatarHint}>PHOTO DE PROFIL</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="PRÉNOM *"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={v => setFirstName(v.toUpperCase())}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="NOM *"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={v => setLastName(v.toUpperCase())}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="FILIÈRE"
            placeholderTextColor="#999"
            value={filiere}
            onChangeText={v => setFiliere(v.toUpperCase())}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="TÉLÉPHONE"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ADRESSE EMAIL"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="MOT DE PASSE *"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="CONFIRMER MDP *"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.saveBtnText}>CRÉER LE PROFIL ✓</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 20, paddingBottom: 40 },
  avatarPicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center', gap: 4 },
  avatarIcon: { fontSize: 32 },
  avatarHint: { color: COLORS.grayMid, fontSize: 9, fontWeight: '800', fontStyle: 'italic' },
  form: { gap: 12 },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: '#1C1C1C',
    color: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1.5,
    borderColor: '#333',
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: COLORS.navyBlue,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.pill,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 15,
    textTransform: 'uppercase',
  },
});

export default CreateProfileScreen;
