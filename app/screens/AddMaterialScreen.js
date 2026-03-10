// app/screens/AddMaterialScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createMaterial } from '../database/materialQueries';
import PillHeader from '../components/PillHeader';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function AddMaterialScreen({ navigation }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async (source) => {
    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    }
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Nom requis', 'Entrez le nom du matériel.');
    setSaving(true);
    try {
      await createMaterial({ name: name.trim().toUpperCase(), image });
      Alert.alert('Enregistré !', `"${name.toUpperCase()}" ajouté.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <PillHeader title="Ajouter un matériel" />

      {/* Carte prévisualisation */}
      <View style={styles.previewCard}>
        <TouchableOpacity style={styles.imgBox} onPress={() => pickImage('gallery')}>
          {image
            ? <Image source={{ uri: image }} style={styles.img} resizeMode="contain" />
            : <Text style={styles.imgPlaceholder}>➕</Text>
          }
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={v => setName(v.toUpperCase())}
          placeholder="NOM DU MATÉRIEL"
          placeholderTextColor="#AAA"
          autoCapitalize="characters"
        />
      </View>

      {/* Boutons source photo */}
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage('camera')}>
          <Text style={styles.photoBtnText}>📸 Caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage('gallery')}>
          <Text style={styles.photoBtnText}>🖼️ Galerie</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>✓ ENREGISTRER</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg, alignItems: 'center' },
  previewCard: {
    backgroundColor: COLORS.navyBlue, borderRadius: 28, padding: 16,
    width: 240, alignItems: 'center', marginBottom: 24, ...CARD_SHADOW,
  },
  imgBox: {
    width: 160, height: 160, backgroundColor: '#fff', borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12,
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: { fontSize: 48 },
  nameInput: {
    width: '100%', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
    fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic',
    color: '#000', textAlign: 'center', textTransform: 'uppercase',
  },
  photoRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  photoBtn: { backgroundColor: COLORS.navyBlue, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12, ...CARD_SHADOW },
  photoBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 13 },
  saveBtn: { backgroundColor: COLORS.redBurgundy, borderRadius: 28, paddingHorizontal: 48, paddingVertical: 16, ...CARD_SHADOW },
  saveBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 16, textTransform: 'uppercase' },
});
