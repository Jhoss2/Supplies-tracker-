// app/database/userQueries.js
import { runAsync, getAllAsync, getFirstAsync } from './db';

export const getAllUsers = async () =>
  getAllAsync('SELECT * FROM users ORDER BY created_at DESC');

export const getUserById = async (id) =>
  getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);

export const createUser = async ({ first_name, last_name, phone, email, filiere, password, profile_photo, qr_code }) => {
  const result = await runAsync(
    `INSERT INTO users (first_name, last_name, phone, email, filiere, password, profile_photo, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, phone || '', email || '', filiere || '', password, profile_photo || null, qr_code || null]
  );
  return result.insertId;
};

export const updateUser = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await runAsync(`UPDATE users SET ${fields} WHERE id = ?`, values);
};

export const deleteUser = async (id) =>
  runAsync('DELETE FROM users WHERE id = ?', [id]);

export const verifyUserPassword = async (userId, password) => {
  const user = await getFirstAsync(
    'SELECT id FROM users WHERE id = ? AND password = ?',
    [userId, password]
  );
  return !!user;
};

export const saveBiometricCard = async ({ user_id, card_photo, scan_hash, first_name_detected, last_name_detected }) => {
  const result = await runAsync(
    `INSERT OR REPLACE INTO biometric_cards (user_id, card_photo, scan_hash, first_name_detected, last_name_detected)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, card_photo, scan_hash, first_name_detected, last_name_detected]
  );
  return result.insertId;
};

export const findCardByHash = async (hash) =>
  getFirstAsync(
    `SELECT bc.*, u.first_name, u.last_name, u.filiere, u.phone, u.email, u.profile_photo, u.password
     FROM biometric_cards bc
     JOIN users u ON bc.user_id = u.id
     WHERE bc.scan_hash = ?`,
    [hash]
  );

export const getAllBiometricCards = async () =>
  getAllAsync(
    `SELECT bc.*, u.first_name, u.last_name, u.filiere, u.phone, u.email, u.profile_photo
     FROM biometric_cards bc
     LEFT JOIN users u ON bc.user_id = u.id
     ORDER BY bc.created_at DESC`
  );

export const deleteBiometricCard = async (id) =>
  runAsync('DELETE FROM biometric_cards WHERE id = ?', [id]);

