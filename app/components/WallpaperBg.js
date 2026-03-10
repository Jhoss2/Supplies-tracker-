// app/components/WallpaperBg.js
// Wrapper qui applique le fond d'écran (wallpaper) si défini, sinon fond rose
import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/theme';

export default function WallpaperBg({ children, style }) {
  const { backgroundImage } = useApp();
  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={[styles.fill, style]}
        resizeMode="cover"
      >
        <View style={styles.overlay}>{children}</View>
      </ImageBackground>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: COLORS.pinkBg }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
});
