import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as Crypto from 'expo-crypto';
import { createUser, saveBiometricCard } from '../database/userQueries';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

/** * OCR : Analyse du texte extrait de la carte U-AUBEN 
 */
const parseUAubenCard = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  let nom = '', prenoms = '', filiere = '', matricule = '';

  // Recherche de l'indice pivot "CARTE D'ETUDIANT"
  const carteIdx = lines.findIndex(l => 
    l.toUpperCase().includes("CARTE") || l.toUpperCase().includes("ETUDIANT")
  );

  if (carteIdx !== -1 && lines[carteIdx + 1]) {
    nom = lines[carteIdx + 1].toUpperCase();
    prenoms = lines[carteIdx + 2] || '';
  }

  // Extraction de la filière (Lignes contenant Licence, Master, etc.)
  filiere = lines.find(l => 
    /LICENCE|MASTER|BTS|DUT|INGENIEUR/i.test(l)
  ) || '';

  return { nom, prenoms, filiere };
};

export default function CreateProfileScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [cardPhoto, setCardPhoto] = useState(null);

  /** * SCAN DE LA CARTE 
   */
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      const result = await TextRecognition.recognize(photo.uri);
      
      const parsed = parseUAubenCard(result.text);
      setLastName(parsed.nom);
      setFirstName(parsed.prenoms);
      setFiliere(parsed.filiere);
      setCardPhoto(photo.uri);
      
      setIsCameraVisible(false);
    } catch (e) {
      Alert.alert("Erreur Scan", "Impossible de lire la carte.");
    } finally {
      setIsProcessing(false);
    }
  };

  /** * PHOTO DE PROFIL 
   */
  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };

  /** * ENREGISTREMENT 
   */
  const handleSave = async () => {
    if (!firstName || !lastName || !password) {
      return Alert.alert("Erreur", "Prénom, Nom et Mot de passe requis.");
    }

    try {
      const userId = await createUser({
        first_name: firstName,
        last_name: lastName,
        phone,
        filiere,
        password,
        profile_photo: profilePhoto,
      });

      if (cardPhoto) {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${lastName}${firstName}${Date.now()}`
        );
        await saveBiometricCard({
          user_id: userId,
          card_photo: cardPhoto,
          scan_hash: hash,
          first_name_detected: firstName,
          last_name_detected: lastName
        });
      }

      Alert.alert("Succès", "Profil créé avec succès !");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Échec de la création du profil.");
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Accès caméra requis</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <WallpaperBg>
      <PillHeader title="Nouveau Profil" />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Section Photo de Profil */}
        <TouchableOpacity style={styles.photoSection} onPress={pickProfilePhoto}>
          <Image 
            source={profilePhoto ? { uri: profilePhoto } : require('../../assets/avatar-placeholder.png')} 
            style={styles.avatar} 
          />
          <Text style={styles.photoLink}>Changer la photo</Text>
        </TouchableOpacity>

        {/* Formulaire */}
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="NOM" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="PRÉNOM" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="FILIÈRE" value={filiere} onChangeText={setFiliere} />
          <TextInput style={styles.input} placeholder="TÉLÉPHONE" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="MOT DE PASSE (4-6 chiffres)" secureTextEntry keyboardType="numeric" value={password} onChangeText={setPassword} />
          
          <TouchableOpacity style={styles.scanBtn} onPress={() => setIsCameraVisible(true)}>
            <Text style={styles.scanBtnText}>📷 Scanner Carte U-AUBEN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Enregistrer le Profil</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Caméra pour le Scan */}
        <Modal visible={isCameraVisible} animationType="slide">
          <CameraView ref={cameraRef} style={styles.camera}>
            <View style={camStyles.overlay}>
              <View style={camStyles.frame} />
              {isProcessing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={camStyles.btnRow}>
                  <TouchableOpacity style={camStyles.cancelBtn} onPress={() => setIsCameraVisible(false)}>
                    <Text style={{color: '#fff'}}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={camStyles.captureBtn} onPress={handleCapture}>
                    <View style={camStyles.captureInner} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </CameraView>
        </Modal>

      </ScrollView>
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  photoSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: COLORS.navyBlue },
  photoLink: { marginTop: 8, color: COLORS.navyBlue, fontWeight: '700', textDecorationLine: 'underline' },
  form: { paddingHorizontal: 30, gap: 15 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  scanBtn: { backgroundColor: COLORS.redBurgundy, padding: 15, borderRadius: 12, alignItems: 'center' },
  scanBtnText: { color: '#fff', fontWeight: '800' },
  saveBtn: { backgroundColor: COLORS.navyBlue, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, ...CARD_SHADOW },
  saveBtnText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase' },
  camera: { flex: 1 },
});

const camStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  frame: { width: '80%', height: 200, borderWidth: 2, borderColor: '#fff', borderStyle: 'dashed', borderRadius: 15 },
  btnRow: { position: 'absolute', bottom: 50, flexDirection: 'row', alignItems: 'center', gap: 40 },
  captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#fff' },
  cancelBtn: { backgroundColor: '#444', padding: 10, borderRadius: 8 }
});

