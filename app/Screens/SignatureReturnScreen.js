// app/screens/SignatureReturnScreen.js
import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { signReturnTransaction } from '../database/roomQueries';
import { freeRoom } from '../database/roomQueries';
import { COLORS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const SignatureReturnScreen = ({ navigation, route }) => {
  const { transaction, room } = route.params;
  const { refreshRooms, clearTransaction } = useApp();
  const sigRef = useRef(null);
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOK = async (signatureData) => {
    if (!signatureData) return;
    setIsSaving(true);
    try {
      await signReturnTransaction(transaction.id, signatureData);
      await freeRoom(room.id);
      await refreshRooms();
      clearTransaction();
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidatePress = () => {
    sigRef.current?.readSignature();
  };

  const webStyle = `
    .m-signature-pad { box-shadow: none; border: none; width: 100%; height: 100%; }
    .m-signature-pad--body { border: none; }
    .m-signature-pad--footer { display: none; }
    body, html { width: 100%; height: 100%; margin: 0; }
    canvas { width: 100% !important; height: 100% !important; }
  `;

  if (isSigningMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.guideText}>
          Veuillez glisser votre doigt pour signer sur l'écran
        </Text>
        <View style={styles.signatureContainer}>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            onEmpty={() => Alert.alert('Signature vide', 'Veuillez signer.')}
            descriptionText=""
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
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => sigRef.current?.clearSignature()}>
            <Text style={styles.clearBtnText}>🗑️ EFFACER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.validateBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleValidatePress}
            disabled={isSaving}
          >
            {isSaving
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.validateBtnText}>✅ VALIDER LA REMISE</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pillHeader}>
        <Text style={styles.pillHeaderText}>Signature de remise</Text>
      </View>

      <View style={styles.comparisonRow}>
        {/* Signature de prise */}
        <View style={styles.sigFrame}>
          <Text style={styles.sigFrameLabel}>SIGNATURE DE PRISE</Text>
          <View style={styles.sigImgBox}>
            {transaction.signature_take ? (
              <Image
                source={{ uri: transaction.signature_take }}
                style={styles.sigImg}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.noSig}>Aucune signature</Text>
            )}
          </View>
        </View>

        {/* Signature de remise */}
        <TouchableOpacity
          style={[styles.sigFrame, styles.sigFrameEmpty]}
          onPress={() => setIsSigningMode(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.sigFrameLabel}>SIGNATURE DE REMISE</Text>
          <View style={styles.sigImgBox}>
            <Text style={styles.tapToSign}>
              Appuyez pour signer ✍️
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  pillHeader: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
    ...SHADOWS.pill,
  },
  pillHeaderText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  comparisonRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 24,
    paddingBottom: 20,
  },
  sigFrame: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    backgroundColor: '#F9FAFB',
    padding: 12,
    alignItems: 'center',
  },
  sigFrameEmpty: {
    borderColor: COLORS.redBurgundy,
    borderStyle: 'dashed',
  },
  sigFrameLabel: {
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sigImgBox: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigImg: { width: '100%', height: '100%' },
  noSig: { color: COLORS.grayMid, fontStyle: 'italic' },
  tapToSign: {
    color: COLORS.redBurgundy,
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Signing mode
  guideText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#555',
    paddingVertical: 12,
    textTransform: 'uppercase',
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
    gap: 24,
    paddingVertical: 16,
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

export default SignatureReturnScreen;
