// app/database/roomQueries.js + transactionQueries
import { runAsync, getAllAsync, getFirstAsync } from './db';

export const getAllRooms = async () =>
  getAllAsync(
    `SELECT r.*, u.first_name, u.last_name
     FROM rooms r
     LEFT JOIN users u ON r.occupied_by_user_id = u.id
     ORDER BY r.name ASC`
  );

export const getRoomByName = async (name) =>
  getFirstAsync('SELECT * FROM rooms WHERE name = ?', [name]);

export const occupyRoom = async (roomId, userId) =>
  runAsync(
    `UPDATE rooms SET is_occupied = 1, occupied_by_user_id = ?, occupied_since = datetime('now') WHERE id = ?`,
    [userId, roomId]
  );

export const freeRoom = async (roomId) =>
  runAsync(
    `UPDATE rooms SET is_occupied = 0, occupied_by_user_id = NULL, occupied_since = NULL WHERE id = ?`,
    [roomId]
  );

export const createTransaction = async ({ user_id, room_id, material_ids, start_time, end_time, signature_take }) => {
  const result = await runAsync(
    `INSERT INTO transactions (user_id, room_id, material_ids, start_time, end_time, signature_take, status)
     VALUES (?, ?, ?, ?, ?, ?, 'taken')`,
    [user_id, room_id, JSON.stringify(material_ids), start_time, end_time, signature_take]
  );
  return result.insertId;
};

export const getTransactionsByUser = async (userId) =>
  getAllAsync(
    `SELECT t.*, r.name as room_name
     FROM transactions t
     JOIN rooms r ON t.room_id = r.id
     WHERE t.user_id = ?
     ORDER BY t.created_at DESC`,
    [userId]
  );

export const getActiveTransactionByRoom = async (roomId) =>
  getFirstAsync(
    `SELECT t.*, u.first_name, u.last_name
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     WHERE t.room_id = ? AND t.status = 'taken'
     ORDER BY t.created_at DESC
     LIMIT 1`,
    [roomId]
  );

export const updateTransactionMaterials = async (transactionId, material_ids) =>
  runAsync(
    'UPDATE transactions SET material_ids = ? WHERE id = ?',
    [JSON.stringify(material_ids), transactionId]
  );

export const signReturnTransaction = async (transactionId, signature_return) =>
  runAsync(
    `UPDATE transactions SET signature_return = ?, status = 'returned' WHERE id = ?`,
    [signature_return, transactionId]
  );

export const validateTransactionByManager = async (transactionId) =>
  runAsync(
    `UPDATE transactions SET status = 'validated', manager_validated = 1 WHERE id = ?`,
    [transactionId]
  );

export const getAllTransactions = async () =>
  getAllAsync(
    `SELECT t.*, u.first_name, u.last_name, r.name as room_name
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     JOIN rooms r ON t.room_id = r.id
     ORDER BY t.created_at DESC`
  );

