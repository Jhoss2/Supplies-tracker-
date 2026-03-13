import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('uauben.db');

export const initDatabase = async () => {
  try {
    // Activation des clés étrangères
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // Création des tables sécurisée (IF NOT EXISTS)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        filiere TEXT,
        niveau TEXT,
        telephone TEXT,
        id_photo TEXT,
        qr_code TEXT UNIQUE,
        biometric_id TEXT UNIQUE
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'free'
      );

      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        image_uri TEXT,
        quantity INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        room_id INTEGER,
        material_id INTEGER,
        action TEXT,
        signature_take TEXT,
        signature_return TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(room_id) REFERENCES rooms(id),
        FOREIGN KEY(material_id) REFERENCES materials(id)
      );
    `);

    // Tentative de migration silencieuse (ne fera pas crasher l'app si elle échoue)
    try {
      await db.execAsync(`ALTER TABLE users ADD COLUMN id_photo TEXT;`);
    } catch (e) {
      // La colonne existe probablement déjà
    }

    // Seeding sécurisé des salles par défaut (INSERT OR IGNORE)
    const defaultRooms = [
      'AMPHI A', 'AMPHI B', 'AMPHI C', 'AMPHI D', 'AMPHI E', 'AMPHI F',
      'LABO INFO 1', 'LABO INFO 2', 'LABO RESEAU', 'LABO MEDICAL',
      'SALLE 101', 'SALLE 102', 'SALLE 103', 'SALLE 104', 'SALLE 105',
      'SALLE DES PROFS', 'ADMINISTRATION'
    ];

    for (const room of defaultRooms) {
      await db.runAsync(`INSERT OR IGNORE INTO rooms (name) VALUES (?)`, [room]);
    }

    return true;
  } catch (error) {
    console.error("Erreur critique lors de l'initialisation de la DB:", error);
    throw error; // Renvoie l'erreur à App.js pour l'afficher à l'écran au lieu de crasher silencieusement
  }
};

