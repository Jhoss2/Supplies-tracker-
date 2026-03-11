// app/components/TransactionCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, CARD_SHADOW } from '../theme/theme';

const TransactionCard = ({ transaction }) => {
  if (!transaction) return null;
  const { room_name, start_time, end_time, status, material_ids } = transaction;

  const statusColor = status === 'returned' ? COLORS.statusReturned
                    : status === 'validated' ? COLORS.statusValidated
                    : COLORS.statusTaken;

  const statusLabel = status === 'returned' ? 'RENDU'
                    : status === 'validated' ? 'VALIDÉ'
                    : 'EN COURS';

  let matCount = 0;
  try { matCount = JSON.parse(material_ids || '[]').length; } catch {}

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.room}>{room_name || '—'}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.time}>{start_time} – {end_time}</Text>
      <Text style={styles.mats}>{matCount} matériel{matCount > 1 ? 's' : ''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    ...CARD_SHADOW,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  room: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.navyBlue, fontSize: 14, textTransform: 'uppercase', flex: 1, marginRight: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  time: { fontFamily: 'serif', fontStyle: 'italic', color: '#555', fontSize: 13, marginBottom: 2 },
  mats: { fontFamily: 'serif', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 12 },
});

export default TransactionCard;
