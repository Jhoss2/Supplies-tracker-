// app/screens/IdentificationScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as FileSystem from 'expo-file-system';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';
import PillHeader from '../components/PillHeader';
import { saveBiometricCard, findCardByHash } from '../database/userQueries';
import * as Crypto from 'expo-crypto';

const IdentificationScreen = ({ navigation, route }) => {
  const { room } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [mode, setMode] = useState('card'); // 'card' | 'qr'
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);

  // Manual form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  // --- SCAN CARTE ---
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.9 });

      // ML Kit Text Recognition (offline)
      const result = await TextRecognition.recognize(photo.uri);
      const rawText = result.text || '';
      console.log('OCR result:', rawText);

      // Hash de l'image pour comparaison biométrique
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawText.trim().toLowerCase()
      );

      // Chercher dans la base biométrique
      const existing = await findCardByHash(hash);

      if (existing) {
        // Carte reconnue → naviguer vers la liste de profils pour confirmation
        navigation.navigate('UserProfileList', { 
          room, 
          preSelectedUserId: existing.user_id,
          cardPhoto: photo.uri,
          detectedText: rawText
        });
      } else {
        // Nouvelle carte → extraire nom/prénom via heuristique OCR
        const parsed = parseNameFromOCR(rawText);
        setFirstName(parsed.firstName);
        setLastName(parsed.lastName);
        setScannedUser({ cardPhoto: photo.uri, hash, rawText });
      }
    } catch (e) {
      Alert.alert('Erreur', 'Scan impossible. Veuillez remplir le formulaire manuellement.');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Heuristique de parsing du nom OCR (contexte carte universitaire Afrique)
  const parseNameFromOCR = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    // On cherche les lignes en majuscules qui ressemblent à des noms
    const nameLines = lines.filter(l => /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s]{3,}$/.test(l));
    return {
      firstName: nameLines[1] || '',
      lastName: nameLines[0] || '',
    };
  };

  // --- SCAN QR CODE ---
  const handleQRScan = async ({ data }) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Le QR contient l'userId encodé
      const userId = parseInt(data);
      if (!isNaN(userId)) {
        navigation.navigate('UserProfileList', { room, preSelectedUserId: userId });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- VALIDATION FORMULAIRE MANUEL ---
  const handleManualValidate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Champs requis', 'Nom et prénom sont obligatoires.');
      return;
    }
    navigation.navigate('UserProfileList', {
      room,
      manualData: { firstName, lastName, filiere, phone },
      cardPhoto: scannedUser?.cardPhoto || null,
      cardHash: scannedUser?.hash || null,
    });
  };

  if (!permission) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <PillHeader title={`Identification — ${room.name}`} />

      <View style={styles.body}>
        {/* LEFT: Camera */}
        <View style={styles.cameraColumn}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'card' && styles.modeBtnActive]}
              onPress={() => setMode('card')}
            >
              <Text style={[styles.modeBtnText, mode === 'card' && styles.modeBtnTextActive]}>
                🪪 CARTE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'qr' && styles.modeBtnActive]}
              onPress={() => setMode('qr')}
            >
              <Text style={[styles.modeBtnText, mode === 'qr' && styles.modeBtnTextActive]}>
                📷 QR CODE
              </Text>
            </TouchableOpacity>
          </View>

          {permission.granted ? (
            <View style={styles.cameraBox}>
              {mode === 'card' ? (
                <CameraView ref={cameraRef} style={styles.camera} facing="back">
                  <View style={styles.scanFrame} />
                </CameraView>
              ) : (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={handleQRScan}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                >
                  <View style={styles.qrFrame} />
                </CameraView>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permText}>Autoriser la caméra</Text>
            </TouchableOpacity>
          )}

          {mode === 'card' && (
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              disabled={isProcessing}
            >
              {isProcessing
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.captureBtnText}>📸 SCANNER LA CARTE</Text>
              }
            </TouchableOpacity>
          )}
          {mode === 'qr' && (
            <Text style={styles.qrHint}>Présentez votre QR code devant la caméra</Text>
          )}
        </View>

        {/* RIGHT: Form */}
        <View style={styles.formColumn}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>INFORMATIONS PERSONNELLES</Text>

            <TextInput
              style={styles.input}
              placeholder="PRÉNOM"
              placeholderTextColor="#AAA"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="NOM"
              placeholderTextColor="#AAA"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="FILIÈRE"
              placeholderTextColor="#AAA"
              value={filiere}
              onChangeText={(v) => setFiliere(v.toUpperCase())}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="NUMÉRO DE TÉLÉPHONE"
              placeholderTextColor="#AAA"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.validateBtn} onPress={handleManualValidate}>
              <Text style={styles.validateBtnText}>VALIDER ➜</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  cameraColumn: {
    flex: 1.2,
    gap: 10,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeBtnActive: {
    backgroundColor: COLORS.navyBlue,
  },
  modeBtnText: {
    color: COLORS.navyBlue,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  modeBtnTextActive: {
    color: COLORS.white,
  },
  cameraBox: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#333',
  },
  camera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(220,38,38,0.6)',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  qrFrame: {
    width: 160,
    height: 160,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    borderRadius: 12,
  },
  captureBtn: {
    backgroundColor: COLORS.navyBlue,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  captureBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  qrHint: {
    color: COLORS.navyBlue,
    textAlign: 'center',
    fontWeight: '700',
    fontStyle: 'italic',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  permBtn: {
    flex: 1,
    backgroundColor: COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  permText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 15,
  },
  // Form
  formColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: '#FFF0F3',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.pinkBorder || '#FFB3C1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    gap: 10,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.black,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    fontStyle: 'italic',
  },
  validateBtn: {
    backgroundColor: COLORS.navyBlue,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    ...SHADOWS.pill,
  },
  validateBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});

export default IdentificationScreen;
