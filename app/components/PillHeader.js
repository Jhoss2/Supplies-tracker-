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
    paddingVertical: 11,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontWeight: '800',
    fontStyle: 'italic',
    fontSize: 17,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PillHeader;
