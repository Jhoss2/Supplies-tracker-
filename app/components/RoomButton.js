// app/components/RoomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Salles avec halo violet (grisées dans la maquette web)
const SPECIAL_ROOMS = [
  'TOGUYENI', 'SALLE 15', 'SALLE 07', 'SALLE 16', 'SALLE 22',
  'SALLE 23', 'SALLE 04', 'SALLE 19', 'SALLE 18', 'SALLE 27',
  'LAB B ROOM 3', 'AMPHI R.2.A', 'LAB ROOM 2', 'LAB ROOM 3',
  'AMPHI R.2.C', 'AMPHI R.2.D'
];

const RoomButton = ({ text, isOccupied, onPress }) => {
  const isSpecial = SPECIAL_ROOMS.includes(text);

  const glowColor  = isOccupied ? '#CC0000' : isSpecial ? '#6D28D9' : '#991B1B';
  const bgColor    = isOccupied ? '#CC0000'
                   : isSpecial  ? '#B0B0B0'   // gris plus foncé
                   :              '#FFFFFF';   // blanc plus pur
  const textColor  = isOccupied ? '#FFFFFF' : '#000000';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          shadowColor: glowColor,
          shadowOpacity: isOccupied ? 1.0 : 0.95,
          shadowRadius: isOccupied ? 20 : isSpecial ? 18 : 16,
          shadowOffset: { width: 0, height: 0 },
          elevation: isOccupied ? 20 : 14,
          borderColor: isOccupied ? '#FF3333'
                     : isSpecial  ? '#7C3AED'
                     :              '#CC0000',
          borderWidth: isOccupied ? 2.5 : 2,
        }
      ]}
    >
      <Text
        style={[styles.text, { color: textColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontFamily: 'serif',
    fontWeight: '800',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 15,
    flexShrink: 1,
  },
});

export default RoomButton;
