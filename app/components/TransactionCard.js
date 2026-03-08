// app/components/TransactionCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/theme';

const TransactionCard = ({ transaction }) => {
  const materialIds = JSON.parse(transaction.material_ids || '[]');

  const getStatusIcon = () => {
    if (transaction.manager_validated) return { icon: '✅', label: 'VALIDÉ GESTIONNAIRE', color: COLORS.statusValidated };
    if (transaction.status === 'validated') return { icon: '✅', label: 'VALIDÉ', color: COLORS.statusValidated };
    if (transaction.status === 'returned') return { icon: '✔️', label: 'REMIS', color: COLORS.statusReturned };
    return { icon: '❌', label: 'NON REMIS', color: COLORS.statusMissing };
  };

  const status = getStatusIcon();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.roomName}>{transaction.room_name}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: status.color }]}>
          {status.icon} {status.label}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.value}>{new Date(transaction.created_at).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>HEURE DE PRISE</Text>
          <Text style={styles.value}>{new Date(transaction.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>DURÉE DU COURS</Text>
          <Text style={styles.value}>{transaction.start_time} – {transaction.end_time}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>MATÉRIELS</Text>
          <Text style={styles.value}>{materialIds.length} article(s)</Text>
        </View>
      </View>

      {transaction.manager_validated === 1 && (
        <View style={styles.managerBadge}>
          <Text style={styles.managerText}>👔 GESTIONNAIRE A VALIDÉ LE RETOUR</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.navyBlue,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.navyBlue,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 9,
    color: COLORS.grayMid,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  managerBadge: {
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navyBlue,
  },
  managerText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navyBlue,
  },
});

export default TransactionCard;
