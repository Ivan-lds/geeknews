const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    createTables();
  }
});

// Criar tabelas (caso não existam)
function createTables() {
  db.serialize(() => {
    // Tabela Users
    db.run(`CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      username TEXT,
      password TEXT,
      role TEXT
    )`);

    // Tabela Notices
    db.run(`CREATE TABLE IF NOT EXISTS Notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      body TEXT,
      body2 TEXT,
      imageUrl TEXT,
      imageUrl2 TEXT,
      videoUrl TEXT,
      author TEXT,
      date TEXT,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES Users(id)
    )`);

    // Tabela Comments
    db.run(`CREATE TABLE IF NOT EXISTS Comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      text TEXT,
      user TEXT,
      createDate TEXT,
      FOREIGN KEY (postId) REFERENCES Notices(id)
    )`);
  });
}

// Rotas para Users
app.get('/Users', (req, res) => {
  db.all('SELECT * FROM Users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/Users', (req, res) => {
  const { email, username, password, role } = req.body;
  db.run('INSERT INTO Users (email, username, password, role) VALUES (?, ?, ?, ?)',
    [email, username, password, role],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

// Rotas para Notices
app.get('/Notices', (req, res) => {
  db.all('SELECT * FROM Notices', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/Notices/:id', (req, res) => {
  db.get('SELECT * FROM Notices WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/Notices', (req, res) => {
  const { title, body, body2, imageUrl, imageUrl2, videoUrl, author, date, userId } = req.body;
  db.run('INSERT INTO Notices (title, body, body2, imageUrl, imageUrl2, videoUrl, author, date, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, body, body2, imageUrl, imageUrl2, videoUrl, author, date, userId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

app.put('/Notices/:id', (req, res) => {
  const { title, body, body2, imageUrl, imageUrl2, videoUrl, author, date, userId } = req.body;
  db.run('UPDATE Notices SET title = ?, body = ?, body2 = ?, imageUrl = ?, imageUrl2 = ?, videoUrl = ?, author = ?, date = ?, userId = ? WHERE id = ?',
    [title, body, body2, imageUrl, imageUrl2, videoUrl, author, date, userId, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
});

app.delete('/Notices/:id', (req, res) => {
  db.run('DELETE FROM Notices WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Rotas para Comments
app.get('/Comments', (req, res) => {
  db.all('SELECT * FROM Comments', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/Comments/:postId', (req, res) => {
  db.all('SELECT * FROM Comments WHERE postId = ?', [req.params.postId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/Comments', (req, res) => {
  const { postId, text, user, createDate } = req.body;
  db.run('INSERT INTO Comments (postId, text, user, createDate) VALUES (?, ?, ?, ?)',
    [postId, text, user, createDate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 