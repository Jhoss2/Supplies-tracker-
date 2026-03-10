// app/screens/SignatureFirstScreen.js — signature plein écran
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { occupyRoom, createTransaction, updateTransactionMaterials } from '../database/roomQueries';
import { COLORS } from '../theme/theme';

export default function SignatureFirstScreen({ navigation, route }) {
  const { room, user, selectedMaterialIds, startTime, endTime, mode, transactionId } = route.params;
  const sigRef = useRef(null);

  const handleOK = async (signature) => {
    if (!signature || signature === 'data:image/png;base64,') return;
    try {
      if (mode === 'add' && transactionId) {
        // ── Mode AJOUT : on met à jour la transaction existante, pas de nouvelle ──
        await updateTransactionMaterials(transactionId, selectedMaterialIds);
        // Pas de nouvelle occupation (salle déjà occupée)
        Alert.alert('Matériel ajouté ✓', 'Le matériel a été ajouté à la transaction en cours.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        // ── Mode PRISE : nouvelle transaction ──
        await createTransaction({
          user_id: user.id,
          room_id: room.id,
          material_ids: selectedMaterialIds,
          start_time: startTime,
          end_time: endTime,
          signature_take: signature,
        });
        await occupyRoom(room.id, user.id);
        Alert.alert('Signature enregistrée ✓', 'La prise de matériel est confirmée.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleEmpty = () => Alert.alert('Signature vide', 'Veuillez signer avant de valider.');

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.guide}>
        {mode === 'add'
          ? 'AJOUT DE MATÉRIEL — SIGNATURE DE CONFIRMATION'
          : 'PRISE DU MATÉRIEL — SIGNATURE DE L\'ÉTUDIANT'
        }
      </Text>
      <Text style={styles.sub}>{user?.first_name} {user?.last_name} — {room?.name}</Text>

      <View style={styles.sigWrap}>
        <SignatureCanvas
          ref={sigRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          descriptionText=""
          clearText="EFFACER"
          confirmText="VALIDER ✓"
          style={styles.sig}
          webStyle={webStyle}
          backgroundColor="white"
          penColor="black"
          dotSize={3}
          minWidth={2}
          maxWidth={5}
        />
      </View>
    </View>
  );
}

const webStyle = `
  .m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { background: #0D2461; padding: 14px; display: flex; justify-content: space-between; }
  .m-signature-pad--footer .button { background: #8B0000; color: white; font-size: 16px; font-style: italic; font-family: Georgia, serif; font-weight: bold; border: none; padding: 12px 32px; border-radius: 24px; text-transform: uppercase; cursor: pointer; }
  .m-signature-pad--footer .button.clear { background: #444; }
`;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  guide: { textAlign: 'center', paddingVertical: 14, fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 15, color: '#fff', textTransform: 'uppercase', backgroundColor: '#8B0000', letterSpacing: 0.5 },
  sub: { textAlign: 'center', paddingVertical: 8, fontFamily: 'serif', fontStyle: 'italic', fontSize: 13, color: COLORS.navyBlue, backgroundColor: '#fff' },
  sigWrap: { flex: 1, backgroundColor: '#fff' },
  sig: { flex: 1 },
});
