// app/screens/IncompleteProfilesScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../database/db';
import PillHeader from '../components/PillHeader';
import WallpaperBg from '../components/WallpaperBg';
import { COLORS, CARD_SHADOW } from '../theme/theme';

export default function IncompleteProfilesScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);

  useFocusEffect(useCallback(() => {
    db.getAllAsync(`
      SELECT u.*, bc.card_photo FROM users u
      LEFT JOIN biometric_cards bc ON bc.user_id = u.id
      WHERE u.profile_photo IS NULL OR u.profile_photo = ''
         OR bc.card_photo IS NULL
         OR u.id_photo IS NULL OR u.id_photo = ''
      ORDER BY u.last_name ASC
    `).then(setProfiles);
  }, []));

  const renderItem = ({ item }) => {
    const missingProfile = !item.profile_photo;
    const missingCard = !item.card_photo;
    const missingId = !item.id_photo;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UserProfile', { userId: item.id })} activeOpacity={0.85}>
        <View style={styles.avatarBox}>
          {item.profile_photo
            ? <Image source={{ uri: item.profile_photo }} style={styles.avatar} />
            : <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>{(item.first_name[0]||'')+(item.last_name[0]||'')}</Text>
              </View>
          }
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.filiere}>{item.filiere || '—'}</Text>
          <View style={styles.badges}>
            {missingProfile && <View style={styles.badge}><Text style={styles.badgeText}>📷 Photo profil manquante</Text></View>}
            {missingCard && <View style={styles.badge}><Text style={styles.badgeText}>🪪 Photo carte manquante</Text></View>}
            {missingId && <View style={styles.badge}><Text style={styles.badgeText}>🆔 Pièce d'identité manquante</Text></View>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <WallpaperBg>
      <PillHeader title="Profils incomplets" />
      <Text style={styles.count}>{profiles.length} profil{profiles.length > 1 ? 's' : ''} incomplet{profiles.length > 1 ? 's' : ''}</Text>
      <FlatList
        data={profiles}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>✅ Tous les profils sont complets !</Text>
          </View>
        }
      />
    </WallpaperBg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  count: { textAlign: 'center', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 16, marginBottom: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18,
    padding: 14, marginBottom: 12, alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.pinkBorder, ...CARD_SHADOW,
  },
  avatarBox: { marginRight: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, borderColor: COLORS.navyBlue },
  avatarFallback: { backgroundColor: COLORS.navyBlue, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 22, fontFamily: 'serif', fontWeight: '800' },
  info: { flex: 1 },
  name: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 15, textTransform: 'uppercase' },
  filiere: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 16, marginBottom: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FCA5A5' },
  badgeText: { fontFamily: 'serif', fontStyle: 'italic', color: '#991B1B', fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: '#065F46', fontSize: 16 },
});
