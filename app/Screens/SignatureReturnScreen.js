// app/screens/SignatureReturnScreen.js
import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { signReturnTransaction, freeRoom } from '../database/roomQueries';
import { COLORS } from '../theme/theme';

export default function SignatureReturnScreen({ navigation, route }) {
  const { room, user, transaction } = route.params;
  const sigRef = useRef(null);

  const handleOK = async (signature) => {
    if (!signature || signature === 'data:image/png;base64,') return;
    try {
      await signReturnTransaction(transaction.id, signature);
      await freeRoom(room.id);
      Alert.alert('Retour confirmé ✓', 'Matériel restitué avec succès.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e) { Alert.alert('Erreur', e.message); }
  };

  const handleEmpty = () => Alert.alert('Signature vide', 'Veuillez signer avant de valider.');

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.guide}>RETOUR DU MATÉRIEL — SIGNATURE</Text>
      <Text style={styles.sub}>{user?.first_name} {user?.last_name} — {room?.name}</Text>

      <View style={styles.splitView}>
        {/* Signature de prise (gauche) */}
        <View style={styles.half}>
          <Text style={styles.halfLabel}>SIGNATURE DE PRISE</Text>
          {transaction?.signature_take
            ? <Image source={{ uri: transaction.signature_take }} style={styles.oldSig} resizeMode="contain" />
            : <View style={styles.noSig}><Text style={styles.noSigText}>—</Text></View>
          }
        </View>

        {/* Nouvelle signature (droite) */}
        <View style={styles.half}>
          <Text style={styles.halfLabel}>SIGNATURE DE RETOUR</Text>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            onEmpty={handleEmpty}
            descriptionText=""
            clearText="EFFACER"
            confirmText="CONFIRMER ✓"
            style={{ flex: 1 }}
            webStyle={webStyle}
            backgroundColor="white"
            penColor="black"
          />
        </View>
      </View>
    </View>
  );
}

const webStyle = `
  .m-signature-pad { box-shadow: none; border: none; height: 100%; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { background: #0D2461; padding: 10px; display: flex; justify-content: space-between; }
  .m-signature-pad--footer .button { background: #8B0000; color: white; font-size: 14px; font-style: italic; font-family: Georgia, serif; font-weight: bold; border: none; padding: 10px 24px; border-radius: 20px; text-transform: uppercase; cursor: pointer; }
  .m-signature-pad--footer .button.clear { background: #444; }
`;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  guide: { textAlign: 'center', paddingVertical: 12, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, textTransform: 'uppercase', backgroundColor: '#8B0000', color: '#fff' },
  sub: { textAlign: 'center', paddingVertical: 7, fontFamily: 'serif', fontStyle: 'italic', fontSize: 13, color: COLORS.navyBlue, backgroundColor: '#fff' },
  splitView: { flex: 1, flexDirection: 'row' },
  half: { flex: 1, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  halfLabel: { textAlign: 'center', padding: 10, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 13, color: COLORS.navyBlue, textTransform: 'uppercase', backgroundColor: '#F8F8F8', borderBottomWidth: 1, borderBottomColor: '#eee' },
  oldSig: { flex: 1, width: '100%' },
  noSig: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noSigText: { fontSize: 40, color: '#ccc' },
});
