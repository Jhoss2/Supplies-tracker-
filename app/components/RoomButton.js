// app/components/RoomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

// Salles avec halo violet (grisées dans la maquette web)
const SPECIAL_ROOMS = [
  'TOGUYENI', 'SALLE 15', 'SALLE 07', 'SALLE 16', 'SALLE 22',
  'SALLE 23', 'SALLE 04', 'SALLE 19', 'SALLE 18', 'SALLE 27',
  'LAB B ROOM 3', 'AMPHI R.2.A', 'LAB ROOM 2', 'LAB ROOM 3',
  'AMPHI R.2.C', 'AMPHI R.2.D'
];

const GLOW_VIOLET  = '#8B5CF6';  // halo violet — salles spéciales
const GLOW_RED     = '#DC2626';  // halo rouge  — salles standard
const GLOW_OCCUPIED = '#DC2626'; // halo rouge vif — occupé

const RoomButton = ({ text, isOccupied, onPress }) => {
  const isSpecial = SPECIAL_ROOMS.includes(text);

  const glowColor = isOccupied ? GLOW_OCCUPIED : isSpecial ? GLOW_VIOLET : GLOW_RED;
  const bgColor   = isOccupied ? '#DC2626' : isSpecial ? '#E0E0E0' : '#FFFFFF';
  const textColor = isOccupied ? '#FFFFFF' : '#000000';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          shadowColor: glowColor,
          shadowOpacity: 0.85,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: isOccupied ? 14 : 8,
          borderColor: isOccupied ? '#FF4444' : '#9CA3AF',
        }
      ]}
    >
      <Text
        style={[styles.text, { color: textColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  text: {
    fontSize: 11,          // taille de base — adjustsFontSizeToFit adapte au conteneur
    fontFamily: 'serif',
    fontWeight: '800',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default RoomButton;
