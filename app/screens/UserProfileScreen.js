// app/screens/UserProfileScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, FlatList,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { getUserById } from '../database/userQueries';
import { getTransactionsByUser } from '../database/roomQueries';
import TransactionCard from '../components/TransactionCard';
import PillHeader from '../components/PillHeader';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const UserProfileScreen = ({ navigation, route }) => {
  const { userId, room } = route.params;
  const { startTransaction } = useApp();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showQR, setShowQR] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [userId])
  );

  const loadData = async () => {
    const u = await getUserById(userId);
    setUser(u);
    const txs = await getTransactionsByUser(userId);
    setTransactions(txs);
  };

  const handleNewTransaction = () => {
    if (!room) {
      Alert.alert('Erreur', 'Aucune salle sélectionnée.');
      return;
    }
    startTransaction(room, user);
    navigation.navigate('RoomProfile', { room, user });
  };

  if (!user) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* HEADER PILL ROUGE */}
      <View style={styles.pillHeader}>
        <Text style={styles.pillHeaderText}>PROFIL — {user.first_name} {user.last_name}</Text>
      </View>

      <View style={styles.body}>
        {/* Colonne gauche : infos */}
        <View style={styles.infoColumn}>
          {/* Avatar circulaire */}
          <View style={styles.avatarCircle}>
            {user.profile_photo ? (
              <Image source={{ uri: user.profile_photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {user.first_name[0]}{user.last_name[0]}
                </Text>
              </View>
            )}
          </View>

          {/* Infos */}
          <Text style={styles.fullName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.infoLine}>📚 {user.filiere || 'Filière non renseignée'}</Text>
          <Text style={styles.infoLine}>📞 {user.phone || '—'}</Text>
          <Text style={styles.infoLine}>✉️ {user.email || '—'}</Text>
          <Text style={styles.infoLine}>📊 {transactions.length} prise(s)</Text>

          {/* QR Code */}
          {showQR && (
            <View style={styles.qrBox}>
              <QRCode value={user.id.toString()} size={120} />
            </View>
          )}
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => setShowQR(!showQR)}
          >
            <Text style={styles.qrBtnText}>{showQR ? '❌ MASQUER' : '📱 MON QR CODE'}</Text>
          </TouchableOpacity>

          {/* Bouton nouvelle transaction */}
          {room && (
            <TouchableOpacity style={styles.newTxBtn} onPress={handleNewTransaction}>
              <Text style={styles.newTxBtnText}>NOUVELLE TRANSACTION ➜</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Colonne droite : historique */}
        <View style={styles.historyColumn}>
          <Text style={styles.historyTitle}>HISTORIQUE DES PRISES</Text>
          <FlatList
            data={transactions}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <TransactionCard transaction={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>Aucune transaction enregistrée</Text>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  pillHeader: {
    backgroundColor: COLORS.redBurgundy,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
    ...SHADOWS.pill,
  },
  pillHeaderText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: { flex: 1, flexDirection: 'row', paddingHorizontal: 16, gap: 16 },
  infoColumn: {
    width: 220,
    alignItems: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.navyBlue,
    ...SHADOWS.card,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: COLORS.white, fontSize: 32, fontWeight: '900' },
  fullName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  infoLine: {
    color: COLORS.grayMid,
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  qrBox: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  qrBtn: {
    backgroundColor: COLORS.navyBlueDark || '#0F1F5C',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    ...SHADOWS.pill,
  },
  qrBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  newTxBtn: {
    backgroundColor: COLORS.navyBlue,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    ...SHADOWS.pill,
  },
  newTxBtnText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  historyColumn: { flex: 1, paddingBottom: 16 },
  historyTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyHistory: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: COLORS.grayMid, fontStyle: 'italic', fontSize: 14 },
});

export default UserProfileScreen;
