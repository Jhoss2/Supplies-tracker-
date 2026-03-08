// app/components/MaterialCard.js
import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';

const MaterialCard = ({ item, isSelected, onPress, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        disabled && styles.disabledCard,
      ]}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
        )}
      </View>
      <Text style={[styles.name, isSelected && styles.selectedName]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 4 / 5,
    borderRadius: RADIUS.card,
    borderWidth: 3,
    borderColor: COLORS.navyBlue,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...SHADOWS.card,
    margin: 6,
  },
  selectedCard: {
    backgroundColor: 'rgba(220,38,38,0.12)',
    borderColor: COLORS.redLight,
    transform: [{ scale: 1.05 }],
  },
  disabledCard: {
    opacity: 0.5,
  },
  imageContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  name: {
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  selectedName: {
    color: COLORS.redLight,
  },
});

export default MaterialCard;
