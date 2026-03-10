// app/components/PillHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PillHeader = ({ title, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.text}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B0000',
    borderRadius: 50,
    paddingVertical: 13,
    paddingHorizontal: 44,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 28,    // grand espace sous le header sur tous les écrans
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontWeight: '800',
    fontStyle: 'italic',
    fontSize: 19,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PillHeader;
