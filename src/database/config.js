import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Configuração do banco de dados
export const dbConfig = {
  filename: 'database.sqlite',
  driver: sqlite3.Database
};

// Criar tabelas
export const createTables = async (db) => {
  try {
    // Primeiro, criar as tabelas que não precisam de alteração
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
    `);

    // Verificar se a tabela comments existe
    const commentsTableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='comments'
    `);

    if (!commentsTableExists) {
      // Se a tabela não existe, criar com a estrutura correta
      await db.exec(`
        CREATE TABLE comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          user TEXT NOT NULL,
          comment TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          likes INTEGER DEFAULT 0,
          dislikes INTEGER DEFAULT 0,
          FOREIGN KEY (post_id) REFERENCES posts(id)
        );
      `);
    } else {
      // Se a tabela existe, verificar se precisa de migração
      const columns = await db.all(`
        PRAGMA table_info(comments)
      `);
      
      const hasLikesColumn = columns.some(col => col.name === 'likes');
      const hasDislikesColumn = columns.some(col => col.name === 'dislikes');

      if (!hasLikesColumn) {
        await db.exec('ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0;');
      }
      if (!hasDislikesColumn) {
        await db.exec('ALTER TABLE comments ADD COLUMN dislikes INTEGER DEFAULT 0;');
      }
    }

    // Verificar se a tabela comment_reactions existe
    const reactionsTableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='comment_reactions'
    `);

    if (!reactionsTableExists) {
      console.log('Criando tabela comment_reactions...');
      await db.exec(`
        CREATE TABLE comment_reactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id INTEGER NOT NULL,
          user TEXT NOT NULL,
          reaction_type TEXT NOT NULL CHECK(reaction_type IN ('like', 'dislike')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (comment_id) REFERENCES comments(id),
          UNIQUE(comment_id, user)
        );
      `);
      console.log('Tabela comment_reactions criada com sucesso');
    } else {
      console.log('Tabela comment_reactions já existe');
    }

  } catch (error) {
    console.error('Erro ao criar/migrar tabelas:', error);
    throw error;
  }
};

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  const db = await open(dbConfig);
  await createTables(db);
  return db;
}; 