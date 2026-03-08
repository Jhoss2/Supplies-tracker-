// app/database/userQueries.js
import { getDB } from './db';

export const getAllUsers = async () => {
  const db = getDB();
  return await db.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
};

export const getUserById = async (id) => {
  const db = getDB();
  return await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);
};

export const createUser = async ({ first_name, last_name, phone, email, filiere, password, profile_photo, qr_code }) => {
  const db = getDB();
  const result = await db.runAsync(
    `INSERT INTO users (first_name, last_name, phone, email, filiere, password, profile_photo, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, phone || '', email || '', filiere || '', password, profile_photo || null, qr_code || null]
  );
  return result.lastInsertRowId;
};

export const updateUser = async (id, data) => {
  const db = getDB();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await db.runAsync(`UPDATE users SET ${fields} WHERE id = ?`, values);
};

export const deleteUser = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
};

export const verifyUserPassword = async (userId, password) => {
  const db = getDB();
  const user = await db.getFirstAsync(
    'SELECT id FROM users WHERE id = ? AND password = ?',
    [userId, password]
  );
  return !!user;
};

// Biometric card queries
export const saveBiometricCard = async ({ user_id, card_photo, scan_hash, first_name_detected, last_name_detected }) => {
  const db = getDB();
  const result = await db.runAsync(
    `INSERT OR REPLACE INTO biometric_cards (user_id, card_photo, scan_hash, first_name_detected, last_name_detected)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, card_photo, scan_hash, first_name_detected, last_name_detected]
  );
  return result.lastInsertRowId;
};

export const findCardByHash = async (hash) => {
  const db = getDB();
  return await db.getFirstAsync(
    `SELECT bc.*, u.first_name, u.last_name, u.filiere, u.phone, u.email, u.profile_photo, u.password
     FROM biometric_cards bc
     JOIN users u ON bc.user_id = u.id
     WHERE bc.scan_hash = ?`,
    [hash]
  );
};

export const getAllBiometricCards = async () => {
  const db = getDB();
  return await db.getAllAsync(
    `SELECT bc.*, u.first_name, u.last_name, u.filiere, u.phone, u.email, u.profile_photo
     FROM biometric_cards bc
     LEFT JOIN users u ON bc.user_id = u.id
     ORDER BY bc.created_at DESC`
  );
};

export const deleteBiometricCard = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM biometric_cards WHERE id = ?', [id]);
};
