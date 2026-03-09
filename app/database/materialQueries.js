// app/database/materialQueries.js
import { db } from './db';

export const getAllMaterials = async () =>
  db.getAllAsync('SELECT * FROM materials ORDER BY name ASC');

export const getMaterialsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db.getAllAsync(`SELECT * FROM materials WHERE id IN (${placeholders})`, ids);
};

export const createMaterial = async ({ name, image }) => {
  const result = await db.runAsync(
    'INSERT INTO materials (name, image) VALUES (?, ?)',
    [name.toUpperCase(), image || null]
  );
  return result.lastInsertRowId;
};

export const updateMaterial = async (id, { name, image }) =>
  db.runAsync('UPDATE materials SET name = ?, image = ? WHERE id = ?', [name.toUpperCase(), image, id]);

export const deleteMaterial = async (id) =>
  db.runAsync('DELETE FROM materials WHERE id = ?', [id]);
