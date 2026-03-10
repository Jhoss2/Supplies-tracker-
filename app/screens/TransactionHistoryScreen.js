// app/screens/TransactionHistoryScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, CARD_SHADOW } from '../theme/theme';
import PillHeader from '../components/PillHeader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { db } from '../database/db';

const MATERIAL_KEYS = [
  'PROJECTEUR MOBILE','COMMANDE PROJECT','COMMANDE CLIM',
  'MICRO FILAIRE','MICRO BALLADEUR','RALLONGE','CÂBLE HDMI','CABLE VGA'
];

const RED_CELL = { backgroundColor: '#8B0000', color: '#fff' };

const fetchHistory = async () => {
  const transactions = await db.getAllAsync(`
    SELECT t.*, u.first_name, u.last_name, r.name as room_name
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    JOIN rooms r ON t.room_id = r.id
    ORDER BY t.created_at DESC
    LIMIT 30
  `);
  // Récupérer les matériaux de chaque transaction
  const materials = await db.getAllAsync('SELECT * FROM materials');
  return { transactions, materials };
};

export default function TransactionHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchHistory().then(({ transactions: t, materials: m }) => {
      setTransactions(t);
      setMaterials(m);
      setLoading(false);
    });
  }, []));

  const getMaterialCheck = (transaction, materialName) => {
    try {
      const ids = JSON.parse(transaction.material_ids || '[]');
      const mat = materials.find(m => m.name === materialName);
      return mat && ids.includes(mat.id) ? 'V' : 'X';
    } catch { return 'X'; }
  };

  const formatTime = (s, e) => s && e ? `${s} – ${e}` : '—';

  // ─── Export PDF ───────────────────────────────────────────────────
  const exportPDF = async () => {
    if (transactions.length === 0) return Alert.alert('Aucune donnée', 'Pas de transactions à exporter.');
    setExporting(true);

    // Générer les colonnes (max 8 par page pour lisibilité)
    const cols = transactions.slice(0, 12);
    const colsHtml = cols.map(t => `<th style="min-width:130px;background:#1E3A8A;color:#fff;font-style:italic;padding:8px;border:2px solid #0D2461;font-size:11px;">${t.room_name}</th>`).join('');
    const nameRow = cols.map(t => `<td style="text-align:center;border:2px solid #ccc;padding:6px;font-style:italic;font-size:11px;">${t.first_name} ${t.last_name}</td>`).join('');
    const timeRow = cols.map(t => `<td style="text-align:center;border:2px solid #ccc;padding:6px;font-style:italic;font-size:11px;">${formatTime(t.start_time, t.end_time)}</td>`).join('');
    const matRows = MATERIAL_KEYS.map(key => {
      const cells = cols.map(t => {
        const v = getMaterialCheck(t, key);
        const color = v === 'V' ? '#000' : '#999';
        return `<td style="text-align:center;border:2px solid #ccc;padding:6px;font-weight:bold;color:${color};font-size:13px;">${v}</td>`;
      }).join('');
      return `<tr><td style="background:#8B0000;color:#fff;font-weight:bold;font-style:italic;padding:8px;border:2px solid #6B0000;font-size:11px;white-space:nowrap;">${key}</td>${cells}</tr>`;
    }).join('');

    const html = `
    <html><head><meta charset="UTF-8"/>
    <style>body{font-family:Georgia,serif;background:#fff;margin:20px;}
    h1{color:#8B0000;font-style:italic;text-align:center;font-size:22px;margin-bottom:20px;}
    table{border-collapse:collapse;width:100%;}
    </style></head><body>
    <h1>📊 HISTORIQUE DES TRANSACTIONS — U-AUBEN</h1>
    <table>
      <thead>
        <tr>
          <th style="background:#8B0000;color:#fff;font-style:italic;padding:8px;border:2px solid #6B0000;font-size:11px;">CHAMPS</th>
          ${colsHtml}
        </tr>
      </thead>
      <tbody>
        <tr><td style="background:#8B0000;color:#fff;font-weight:bold;font-style:italic;padding:8px;border:2px solid #6B0000;font-size:11px;">NOM DE LA SALLE</td>${nameRow}</tr>
        <tr><td style="background:#8B0000;color:#fff;font-weight:bold;font-style:italic;padding:8px;border:2px solid #6B0000;font-size:11px;">NOM &amp; PRÉNOM</td>${nameRow}</tr>
        <tr><td style="background:#8B0000;color:#fff;font-weight:bold;font-style:italic;padding:8px;border:2px solid #6B0000;font-size:11px;">DURÉE PRÉVUE</td>${timeRow}</tr>
        ${matRows}
      </tbody>
    </table>
    <p style="text-align:right;color:#888;font-size:10px;margin-top:20px;">Exporté le ${new Date().toLocaleDateString('fr-FR')} — U-AUBEN Supplies Tracker</p>
    </body></html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Historique des transactions' });
    } catch (e) { Alert.alert('Erreur', 'Export PDF impossible: ' + e.message); }
    finally { setExporting(false); }
  };

  if (loading) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.navyBlue} />
    </View>
  );

  // ─── Lignes statiques rouges ───────────────────────────────────
  const STATIC_ROWS = [
    { key: 'room', label: 'NOM DE LA SALLE' },
    { key: 'user', label: 'NOM & PRÉNOM' },
    { key: 'time', label: 'DURÉE PRÉVUE' },
    ...MATERIAL_KEYS.map(k => ({ key: k, label: k })),
  ];

  return (
    <View style={styles.container}>
      <PillHeader title="Historique des transactions" />

      {/* Bouton export */}
      <TouchableOpacity style={styles.exportBtn} onPress={exportPDF} disabled={exporting}>
        {exporting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.exportBtnText}>📥 TÉLÉCHARGER EN PDF</Text>
        }
      </TouchableOpacity>

      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune transaction enregistrée</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
          <View style={styles.table}>
            {/* Colonne fixe labels */}
            <View style={styles.labelCol}>
              <View style={[styles.labelCell, styles.labelHeader]}>
                <Text style={styles.labelHeaderText}>CHAMPS</Text>
              </View>
              {STATIC_ROWS.map(row => (
                <View key={row.key} style={styles.labelCell}>
                  <Text style={styles.labelText} numberOfLines={2}>{row.label}</Text>
                </View>
              ))}
            </View>

            {/* Scroll horizontal des transactions */}
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={styles.dataArea}>
                {/* Entête colonnes (noms de salle) */}
                <View style={styles.dataRow}>
                  {transactions.map(t => (
                    <View key={t.id} style={[styles.dataCell, styles.dataHeaderCell]}>
                      <Text style={styles.dataHeaderText} numberOfLines={1}>{t.room_name}</Text>
                    </View>
                  ))}
                </View>

                {/* Lignes de données */}
                {STATIC_ROWS.map(row => (
                  <View key={row.key} style={styles.dataRow}>
                    {transactions.map(t => {
                      let val = '—';
                      if (row.key === 'room') val = t.room_name;
                      else if (row.key === 'user') val = `${t.first_name} ${t.last_name}`;
                      else if (row.key === 'time') val = formatTime(t.start_time, t.end_time);
                      else val = getMaterialCheck(t, row.key);
                      const isV = val === 'V';
                      return (
                        <View key={t.id} style={[styles.dataCell, isV && styles.dataCellV]}>
                          <Text style={[styles.dataCellText, isV && styles.dataCellTextV]}>{val}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const CELL_W = 140;
const CELL_H = 44;
const LABEL_W = 170;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pinkBg },
  exportBtn: {
    alignSelf: 'center', marginBottom: 14,
    backgroundColor: COLORS.navyBlue, borderRadius: 24,
    paddingHorizontal: 28, paddingVertical: 11, ...CARD_SHADOW,
  },
  exportBtnText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 13, textTransform: 'uppercase' },
  tableScroll: { flex: 1 },
  table: { flexDirection: 'row', margin: 10 },
  labelCol: { width: LABEL_W },
  labelHeader: { backgroundColor: COLORS.navyBlue },
  labelHeaderText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase', textAlign: 'center' },
  labelCell: {
    width: LABEL_W, height: CELL_H, backgroundColor: COLORS.redBurgundy,
    justifyContent: 'center', paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#6B0000',
  },
  labelText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase' },
  dataArea: {},
  dataRow: { flexDirection: 'row' },
  dataHeaderCell: { backgroundColor: COLORS.navyBlue, borderWidth: 1, borderColor: '#0D2461' },
  dataHeaderText: { color: '#fff', fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 11, textTransform: 'uppercase', textAlign: 'center' },
  dataCell: { width: CELL_W, height: CELL_H, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.grayBorder, backgroundColor: '#fff' },
  dataCellV: { backgroundColor: '#F0FFF4' },
  dataCellText: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', fontSize: 13, color: '#555', textAlign: 'center' },
  dataCellTextV: { color: '#065F46', fontSize: 15 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: 'serif', fontWeight: '800', fontStyle: 'italic', color: COLORS.grayMid, fontSize: 16 },
});
