// app/components/WallpaperBg.js
// Wrapper fond d'écran — lit directement depuis settingsQueries, pas de useApp()
import React, { useState, useEffect } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { getSetting } from '../database/settingsQueries';

export default function WallpaperBg({ children, style }) {
  const [bg, setBg] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSetting('background_image')
      .then(val => { if (val) setBg(val); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Attendre le chargement pour éviter un flash
  if (!loaded) return (
    <View style={[styles.fill, style]}>{children}</View>
  );

  if (bg) {
    return (
      <ImageBackground
        source={{ uri: bg }}
        style={[styles.fill, style]}
        resizeMode="cover"
      >
        <View style={styles.overlay}>{children}</View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.fill, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#FFF0F3' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
});
