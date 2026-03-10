// app/screens/AddMaterialScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createMaterial, updateMaterial } from '../database/materialQueries';
import { COLORS, CARD_SHADOW, SHADOWS } from '../theme/theme';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';

const AddMaterialScreen = ({ navigation, route }) => {
  const editItem = route.params?.editItem || null;
  const [name, setName] = useState(editItem?.name || '');
  const [image, setImage] = useState(editItem?.image || null);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Le nom du matériel est obligatoire.');
      return;
    }
    if (!image) {
      Alert.alert('Image requise', 'Veuillez choisir une image pour ce matériel.');
      return;
    }
    setIsSaving(true);
    try {
      if (editItem) {
        await updateMaterial(editItem.id, { name: name.trim(), image });
        Alert.alert('Modifié !', 'Matériel mis à jour.');
      } else {
        await createMaterial({ name: name.trim(), image });
        Alert.alert('Enregistré !', 'Nouveau matériel ajouté.');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WallpaperBg>
      <PillHeader title={editItem ? 'Modifier le matériel' : 'Ajouter un matériel'} />

      {/* Grande carte centrée — gris clair, lueur noire prononcée */}
      <View style={styles.centerWrap}>
        <View style={styles.card}>
          {/* Zone image prend la majorité */}
          <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
                <Text style={styles.imagePlaceholderText}>APPUYEZ POUR AJOUTER UNE PHOTO</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.nameInput}
            placeholder="NOM DU MATÉRIEL"
            placeholderTextColor="#999"
            value={name}
            onChangeText={v => setName(v.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          {isSaving
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.saveBtnText}>💾 ENREGISTRER</Text>
          }
        </TouchableOpacity>
      </View>
    </WallpaperBg>
  );
};

const styles = StyleSheet.create({
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },

  // Carte grande, gris clair, lueur noire
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 36,
    padding: 24,
    width: 420,
    alignItems: 'center',
    ...CARD_SHADOW,
  },

  // Image occupe la majorité de la carte
  imageBox: {
    width: 340,
    height: 280,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 10 },
  imagePlaceholderIcon: { fontSize: 52 },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '800',
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: COLORS.grayMid,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  nameInput: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'serif',
    color: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  saveBtn: {
    marginTop: 32,
    backgroundColor: COLORS.redBurgundy,
    paddingHorizontal: 56,
    paddingVertical: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...CARD_SHADOW,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontFamily: 'serif',
    fontSize: 18,
    textTransform: 'uppercase',
  },
});

export default AddMaterialScreen;
