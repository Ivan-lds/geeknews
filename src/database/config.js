import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Configuração do banco de dados
export const dbConfig = {
  filename: 'database.sqlite',
  driver: sqlite3.Database
};

// Criar tabelas
export const createTables = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      reset_token TEXT,
      reset_token_expires TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      body2 TEXT,
      image_url TEXT,
      image_url2 TEXT,
      video_url TEXT,
      author TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      author_id INTEGER,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user TEXT NOT NULL,
      comment TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);
};

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  const db = await open(dbConfig);
  await createTables(db);
  return db;
}; 