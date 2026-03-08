// app/components/PillHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS, RADIUS } from '../theme/theme';

const PillHeader = ({ title, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
    ...SHADOWS.pill,
  },
  text: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});

export default PillHeader;
