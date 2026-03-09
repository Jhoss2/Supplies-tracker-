// app/database/settingsQueries.js
import { db } from './db';

export const getSetting = async (key) => {
  const row = await db.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', [key]);
  return row ? row.value : null;
};

export const setSetting = async (key, value) =>
  db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [key, value]);

export const verifyAdminPassword = async (password) => {
  const stored = await getSetting('admin_password');
  return stored === password;
};

export const updateAdminPassword = async (newPassword) =>
  setSetting('admin_password', newPassword);
