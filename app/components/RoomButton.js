// app/components/RoomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

const SPECIAL_ROOMS = [
  'TOGUYENI', 'SALLE 15', 'SALLE 07', 'SALLE 16', 'SALLE 22',
  'SALLE 23', 'SALLE 04', 'SALLE 19', 'SALLE 18', 'SALLE 27',
  'LAB B ROOM 3', 'AMPHI R.2.A', 'LAB ROOM 2', 'LAB ROOM 3',
  'AMPHI R.2.C', 'AMPHI R.2.D'
];

const RoomButton = ({ text, isOccupied, onPress }) => {
  const isSpecial = SPECIAL_ROOMS.includes(text);

  const glowColor = isOccupied
    ? COLORS.roomGlowOccupied
    : isSpecial
    ? COLORS.roomGlowSpecial
    : COLORS.roomGlowFree;

  const bgColor = isOccupied
    ? COLORS.roomOccupied
    : isSpecial
    ? '#E9E9F0'
    : COLORS.white;

  const textColor = isOccupied ? COLORS.white : COLORS.black;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          shadowColor: glowColor,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          elevation: isOccupied ? 12 : 6,
        }
      ]}
    >
      <Text style={[styles.text, { color: textColor }]} numberOfLines={2}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    fontSize: 9,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default RoomButton;
