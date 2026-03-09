// app/database/materialQueries.js
import { runAsync, getAllAsync, getFirstAsync } from './db';

export const getAllMaterials = async () =>
  getAllAsync('SELECT * FROM materials ORDER BY name ASC');

export const getMaterialsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getAllAsync(`SELECT * FROM materials WHERE id IN (${placeholders})`, ids);
};

export const createMaterial = async ({ name, image }) => {
  const result = await runAsync(
    'INSERT INTO materials (name, image) VALUES (?, ?)',
    [name.toUpperCase(), image || null]
  );
  return result.insertId;
};

export const updateMaterial = async (id, { name, image }) =>
  runAsync(
    'UPDATE materials SET name = ?, image = ? WHERE id = ?',
    [name.toUpperCase(), image, id]
  );

export const deleteMaterial = async (id) =>
  runAsync('DELETE FROM materials WHERE id = ?', [id]);

