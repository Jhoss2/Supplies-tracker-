// app/database/db.js
import * as SQLite from 'expo-sqlite';

// expo-sqlite v11 API (compatible Expo 51 build)
const db = SQLite.openDatabase('uauben.db');

export const getDB = () => db;

const execAsync = (sql) =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(sql),
      reject,
      resolve
    );
  });

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(sql, params, (_, result) => resolve(result)),
      reject
    );
  });

const getAllAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array)),
      reject
    );
  });

const getFirstAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction(
      tx => tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array[0] || null)),
      reject
    );
  });

export { runAsync, getAllAsync, getFirstAsync };

export const initDatabase = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      filiere TEXT,
      password TEXT NOT NULL,
      profile_photo TEXT,
      qr_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS biometric_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      card_photo TEXT,
      scan_hash TEXT UNIQUE,
      first_name_detected TEXT,
      last_name_detected TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      is_occupied INTEGER DEFAULT 0,
      occupied_by_user_id INTEGER,
      occupied_since TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      material_ids TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      signature_take TEXT,
      signature_return TEXT,
      status TEXT DEFAULT 'taken',
      manager_validated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
  ];

  for (const sql of tables) {
    await execAsync(sql);
  }

  const roomNames = [
    'TOUR DU SAVOIR', 'TOGUYENI', 'SALLE 15', 'SALLE 05',
    'SALLE 04', 'SALLE 06', 'SALLE 07', 'SALLE 16', 'SALLE 17',
    'SALLE 18', 'SALLE 19', 'SALLE 21', 'SALLE 22', 'SALLE 23',
    'SALLE 26', 'SALLE 27', 'LAB B ROOM 3', 'LAB ROOM 1',
    'LAB ROOM 2', 'LAB ROOM 3', 'AMPHI R.1', 'AMPHI R.2.A',
    'AMPHI R.2.B', 'AMPHI R.2.C', 'AMPHI R.2.D', 'AMPHI R.4', 'AMPHI R.0'
  ];

  for (const name of roomNames) {
    await runAsync(`INSERT OR IGNORE INTO rooms (name) VALUES (?)`, [name]);
  }

  await runAsync(
    `INSERT OR IGNORE INTO app_settings (key, value) VALUES ('admin_password', 'U-AUBEN SUPPLIES TRACKER')`,
    []
  );

  console.log('✅ Database initialized');
};
