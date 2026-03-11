// app/screens/CreateProfileScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
const TextRecognition = { recognize: async () => ({ text: '' }) }; // mock temporaire
import * as Crypto from 'expo-crypto';
import { createUser, saveBiometricCard } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

// ─── OCR : extraction des données de carte U-AUBEN ───────────────
// Structure carte U-AUBEN :
//  "CARTE D'ETUDIANT" (ligne titre)
//  NOM (ligne majuscules)
//  Prénoms (ligne suivante)
//  Matricule : chiffres précédés de "Matricule" ou seuls
//  Filière : ligne contenant Licence/Master/BTS/DUT + niveau + spécialité
const parseUAubenCard = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  let nom = '', prenoms = '', filiere = '', matricule = '';

  // Chercher l'indice de "CARTE D'ETUDIANT" ou "CARTE ETUDIANT"
  const carteIdx = lines.findIndex(l => /carte.*etudiant/i.test(l));

  // NOM : ligne entièrement en majuscules juste après "CARTE D'ETUDIANT"
  if (carteIdx !== -1) {
    for (let i = carteIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s\-]{2,}$/.test(l) && l.length > 2) {
        nom = l.trim();
        // Prénoms : ligne suivante (mixte majuscules/minuscules)
        if (i + 1 < lines.length) prenoms = lines[i + 1].trim();
        break;
      }
    }
  } else {
    // Fallback : chercher lignes tout-majuscules
    const majLines = lines.filter(l => /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s\-]{3,}$/.test(l));
    if (majLines.length >= 1) nom = majLines[0];
    if (majLines.length >= 2) prenoms = majLines[1];
  }

  // Matricule : 8-10 chiffres consécutifs
  for (const l of lines) {
    const match = l.match(/\b(\d{7,10})\b/);
    if (match) { matricule = match[1]; break; }
  }

  // Filière : ligne contenant Licence/Master/BTS/DUT/Ingénieur
  for (const l of lines) {
    if (/licence|master|bts|dut|ingénieur|ing\./i.test(l)) {
      filiere = l.replace(/niveau\s*[:/]?\s*/i, '').replace(/fili[eè]re\s*[:/]?\s*/i, '').trim();
      break;
    }
  }

  return { nom, prenoms, filiere, matricule };
};

export default function CreateProfileScreen({ navigation, route }) {
  const { room } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [cardPhoto, setCardPhoto] = useState(null);
  const [cardHash, setCardHash] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState('card'); // 'card' | 'profile' | 'id'
  const [idPhoto, setIdPhoto] = useState(null);

  const openCamera = (target) => {
    if (!permission?.granted) { requestPermission(); return; }
    setCameraTarget(target);
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setShowCamera(false);

      if (cameraTarget === 'profile') {
        setProfilePhoto(photo.uri);
      } else if (cameraTarget === 'id') {
        setIdPhoto(photo.uri);
      } else {
        // Scan carte → OCR
        setCardPhoto(photo.uri);
        const result = await TextRecognition.recognize(photo.uri);
        const raw = result.text || '';
        const parsed = parseUAubenCard(raw);
        if (parsed.nom) setLastName(parsed.nom);
        if (parsed.prenoms) setFirstName(parsed.prenoms);
        if (parsed.filiere) setFiliere(parsed.filiere);
        // Hash pour base biométrique
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          raw.trim().toLowerCase().substring(0, 200)
        );
        setCardHash(hash);
        Alert.alert('Carte scannée', `Nom: ${parsed.nom || '?'}\nPrénoms: ${parsed.prenoms || '?'}\nFilière: ${parsed.filiere || '?'}\n\nVérifiez et corrigez si nécessaire.`);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Scan impossible. Renseignez manuellement.');
    } finally {
      setIsScanning(false);
    }
  };

  const pickFromGallery = async (target) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.85 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (target === 'profile') setProfilePhoto(uri);
      else if (target === 'id') setIdPhoto(uri);
      else setCardPhoto(uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return Alert.alert('Champs requis', 'Prénom et nom sont obligatoires.');
    if (!password || password.length < 4) return Alert.alert('Mot de passe requis', 'Minimum 4 caractères.');
    if (password !== confirmPassword) return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    setIsSaving(true);
    try {
      const userId = await createUser({
        first_name: firstName.trim().toUpperCase(),
        last_name: lastName.trim().toUpperCase(),
        phone: phone.trim(), email: email.trim(),
        filiere: filiere.trim().toUpperCase(),
        password, profile_photo: profilePhoto,
        id_photo: idPhoto, qr_code: null,
      });
      if (cardPhoto && cardHash) {
        await saveBiometricCard({ user_id: userId, card_photo: cardPhoto, scan_hash: cardHash, first_name_detected: firstName, last_name_detected: lastName });
      }
      Alert.alert('Profil créé !', `Bienvenue ${firstName}.`, [
        { text: 'OK', onPress: () => navigation.navigate('UserProfile', { userId, room }) }
      ]);
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setIsSaving(false); }
  };

  // Écran caméra
  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={camStyles.overlay}>
            <Text style={camStyles.hint}>
              {cameraTarget === 'card' ? '📸 Cadrez la carte dans le rectangle' : '📸 Prenez la photo'}
            </Text>
            {cameraTarget === 'card' && <View style={camStyles.frame} />}
          </View>
        </CameraView>
        <View style={camStyles.btnRow}>
          <TouchableOpacity style={camStyles.cancelBtn} onPress={() => setShowCamera(false)}>
            <Text style={camStyles.btnText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={camStyles.captureBtn} onPress={handleCapture} disabled={isScanning}>
            {isScanning ? <ActivityIndicator color="#fff" /> : <Text style={camStyles.btnText}>📸 CAPTURER</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <WallpaperBg>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PillHeader title="Créer un profil" />

      {/* === SCAN CARTE === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CARTE ÉTUDIANTE</Text>
        <TouchableOpacity style={styles.cardScanBox} onPress={() => openCamera('card')}>
          {cardPhoto
            ? <Image source={{ uri: cardPhoto }} style={styles.cardImg} resizeMode="cover" />
            : <View style={styles.cardPlaceholder}>
                <Text style={styles.cardIcon}>🪪</Text>
                <Text style={styles.cardHint}>Appuyez pour scanner la carte</Text>
              </View>
          }
        </TouchableOpacity>
        {cardPhoto && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => openCamera('card')}>
            <Text style={styles.rescanText}>🔄 Rescanner</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* === FORMULAIRE === */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMATIONS</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="PRÉNOM *" placeholderTextColor="#AAA" value={firstName} onChangeText={v => setFirstName(v.toUpperCase())} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="NOM *" placeholderTextColor="#AAA" value={lastName} onChangeText={v => setLastName(v.toUpperCase())} />
        </View>
        <TextInput style={styles.input} placeholder="FILIÈRE" placeholderTextColor="#AAA" value={filiere} onChangeText={v => setFiliere(v.toUpperCase())} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="TÉLÉPHONE" placeholderTextColor="#AAA" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="EMAIL" placeholderTextColor="#AAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="MOT DE PASSE *" placeholderTextColor="#AAA" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="CONFIRMER MDP *" placeholderTextColor="#AAA" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        </View>
      </View>

      {/* === PHOTOS OPTIONNELLES === */}
      <View style={styles.photosRow}>
        {/* Photo de profil */}
        <View style={styles.photoBlock}>
          <Text style={styles.sectionTitle}>PHOTO DE PROFIL</Text>
          <TouchableOpacity style={styles.photoBox} onPress={() => openCamera('profile')}>
            {profilePhoto
              ? <Image source={{ uri: profilePhoto }} style={styles.photoImg} />
              : <Text style={styles.photoIcon}>👤</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickFromGallery('profile')}><Text style={styles.galleryLink}>Galerie</Text></TouchableOpacity>
        </View>

        {/* Photo document d'identité */}
        <View style={styles.photoBlock}>
          <Text style={styles.sectionTitle}>PIÈCE D'IDENTITÉ</Text>
          <TouchableOpacity style={styles.idBox} onPress={() => openCamera('id')}>
            {idPhoto
              ? <Image source={{ uri: idPhoto }} style={styles.idImg} />
              : <View style={styles.idPlaceholder}>
                  <Text style={styles.photoIcon}>🪪</Text>
                  <Text style={styles.idHint}>Ajouter la photo du document</Text>
                </View>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickFromGallery('id')}><Text style={styles.galleryLink}>Galerie</Text></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>✓ CRÉER LE PROFIL</Text>}
      </TouchableOpacity>
    </ScrollView>
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 15, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  cardScanBox: { width: '100%', height: 130, borderRadius: 16, borderWidth: 2.5, borderColor: COLORS.navyBlue, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW },
  cardImg: { width: '100%', height: '100%' },
  cardPlaceholder: { alignItems: 'center', gap: 6 },
  cardIcon: { fontSize: 36 },
  cardHint: { fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 16, textTransform: 'uppercase' },
  rescanBtn: { alignSelf: 'center', marginTop: 8 },
  rescanText: { fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: {
    backgroundColor: '#fff', color: '#000', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
    fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic',
    borderWidth: 1.5, borderColor: COLORS.pinkBorder, marginBottom: 10, ...CARD_SHADOW,
  },
  photosRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  photoBlock: { flex: 1, alignItems: 'center' },
  photoBox: { width: 90, height: 90, borderRadius: 45, borderWidth: 2.5, borderColor: COLORS.navyBlue, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...CARD_SHADOW },
  photoImg: { width: '100%', height: '100%' },
  photoIcon: { fontSize: 32 },
  idBox: { width: '100%', height: 90, borderRadius: 14, borderWidth: 2, borderColor: COLORS.navyBlue, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...CARD_SHADOW },
  idImg: { width: '100%', height: '100%' },
  idPlaceholder: { alignItems: 'center', gap: 4 },
  idHint: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 16, textTransform: 'uppercase', textAlign: 'center', paddingHorizontal: 8 },
  galleryLink: { fontFamily: 'serif', fontWeight: '700', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 15, marginTop: 6, textDecorationLine: 'underline' },
  saveBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 50, paddingVertical: 16, alignItems: 'center', ...CARD_SHADOW },
  saveBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase' },
});

const camStyles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10, marginBottom: 20, textAlign: 'center' },
  frame: { width: '85%', height: 140, borderWidth: 3, borderColor: 'rgba(220,38,38,0.7)', borderStyle: 'dashed', borderRadius: 10 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 20, backgroundColor: '#000' },
  cancelBtn: { backgroundColor: '#444', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24 },
  captureBtn: { backgroundColor: '#8B0000', paddingHorizontal: 36, paddingVertical: 14, borderRadius: 24 },
  btnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase' },
});
