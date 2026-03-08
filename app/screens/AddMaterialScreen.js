// app/screens/AddMaterialScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createMaterial, updateMaterial } from '../database/materialQueries';
import { COLORS, SHADOWS } from '../theme/theme';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {editItem ? 'MODIFIER LE MATÉRIEL' : 'AJOUTER UN MATÉRIEL'}
        </Text>
      </View>

      {/* Grosse carte centrée */}
      <View style={styles.card}>
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
          placeholderTextColor="#AAA"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 16,
    marginBottom: 24,
    ...SHADOWS.pill,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    padding: 20,
    width: 340,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  imageBox: {
    width: 220,
    height: 200,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderIcon: { fontSize: 40 },
  imagePlaceholderText: {
    fontSize: 10,
    fontWeight: '800',
    fontStyle: 'italic',
    color: COLORS.grayMid,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: COLORS.redBurgundy,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.pill,
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default AddMaterialScreen;
