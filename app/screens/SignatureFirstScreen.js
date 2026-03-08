// app/screens/SignatureFirstScreen.js
import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { createTransaction, updateTransactionMaterials } from '../database/roomQueries';
import { occupyRoom } from '../database/roomQueries';
import { COLORS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const SignatureFirstScreen = ({ navigation, route }) => {
  const { room, user, mode, selectedMaterialIds, startTime, endTime, transactionId } = route.params;
  const { refreshRooms, setCurrentTransaction } = useApp();
  const sigRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleOK = (signature) => {
    setSigned(true);
    handleSave(signature);
  };

  const handleSave = async (signatureData) => {
    if (!signatureData) {
      Alert.alert('Signature requise', 'Veuillez signer avant de valider.');
      return;
    }
    setIsSaving(true);
    try {
      if (mode === 'take') {
        // Créer la transaction
        const txId = await createTransaction({
          user_id: user.id,
          room_id: room.id,
          material_ids: selectedMaterialIds,
          start_time: startTime,
          end_time: endTime,
          signature_take: signatureData,
        });
        // Marquer la salle comme occupée
        await occupyRoom(room.id, user.id);
        await refreshRooms();
        setCurrentTransaction({ id: txId });
      } else if (mode === 'add') {
        // Mise à jour des matériels
        await updateTransactionMaterials(transactionId, selectedMaterialIds);
      }
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidatePress = () => {
    if (sigRef.current) {
      sigRef.current.readSignature();
    }
  };

  const handleClear = () => {
    sigRef.current?.clearSignature();
    setSigned(false);
  };

  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      width: 100%;
      height: 100%;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      margin: 0;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `;

  return (
    <View style={styles.container}>
      {/* Guide text */}
      <Text style={styles.guideText}>
        Veuillez glisser votre doigt pour signer sur l'écran
      </Text>

      {/* Full screen signature canvas */}
      <View style={styles.signatureContainer}>
        <SignatureCanvas
          ref={sigRef}
          onOK={handleOK}
          onEmpty={() => Alert.alert('Signature vide', 'Veuillez signer.')}
          descriptionText=""
          clearText="Effacer"
          confirmText="Signer"
          webStyle={webStyle}
          autoClear={false}
          imageType="image/png"
          penColor={COLORS.black}
          backgroundColor={COLORS.white}
          dotSize={2}
          minWidth={2}
          maxWidth={5}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>🗑️ EFFACER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.validateBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleValidatePress}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.validateBtnText}>✅ VALIDER</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  guideText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#555',
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 24,
    backgroundColor: COLORS.white,
  },
  clearBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  clearBtnText: {
    color: '#555',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  validateBtn: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
    ...SHADOWS.pill,
  },
  validateBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default SignatureFirstScreen;
