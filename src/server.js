import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  registerUser,
  loginUser,
  generateResetToken,
  resetPassword,
  requireAdmin
} from './auth/auth.js';
import { initializeDatabase } from './database/config.js';

let db;
(async () => {
  try {
    db = await initializeDatabase();
    console.log('Banco de dados conectado');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
})();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Configuração da sessão
app.use(session({
  secret: 'sua_chave_secreta_muito_segura',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  next();
};

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
  try {
    const { user } = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { user } = await loginUser(req.body);
    req.session.user = user;
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao sair da sessão' });
    }
    res.json({ message: 'Logout realizado com sucesso' });
  });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const result = await generateResetToken(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// CRUD Notices
app.get('/Notices', async (req, res) => {
  try {
    const posts = await db.all('SELECT * FROM posts');
    res.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro ao buscar posts' });
  }
});

app.get('/Notices/:id', async (req, res) => {
  try {
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar post' });
  }
});

app.post('/Notices', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, body2, image_url, image_url2, video_url, author } = req.body;
    const result = await db.run(
      'INSERT INTO posts (title, body, body2, image_url, image_url2, video_url, author, date, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"), ?)',
      [title, body, body2, image_url, image_url2, video_url, author, req.session.user.id]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post' });
  }
});

app.put('/Notices/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, body2, image_url, image_url2, video_url, author } = req.body;
    const result = await db.run(
      'UPDATE posts SET title = ?, body = ?, body2 = ?, image_url = ?, image_url2 = ?, video_url = ?, author = ?, date = datetime("now") WHERE id = ?',
      [title, body, body2, image_url, image_url2, video_url, author, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Post não encontrado' });
    res.json({ message: 'Post atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar post' });
  }
});

app.delete('/Notices/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Post não encontrado' });
    res.json({ message: 'Post excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir post' });
  }
});

// CRUD Comments
app.get('/Comments', async (req, res) => {
  try {
    const comments = await db.all('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro ao buscar comentários' });
  }
});

app.get('/Comments/:postId', async (req, res) => {
  try {
    const comments = await db.all('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC', [req.params.postId]);
    res.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários do post:', error);
    res.status(500).json({ message: 'Erro ao buscar comentários do post' });
  }
});

app.post('/Comments', async (req, res) => {
  try {
    if (!db) {
      console.error('Banco de dados não inicializado');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    const { postId, text, user } = req.body;
    console.log('Recebendo requisição de comentário:', { postId, text, user });
    
    if (!postId || !text) {
      console.log('Campos obrigatórios faltando:', { postId, text });
      return res.status(400).json({ message: 'Post ID e texto do comentário são obrigatórios' });
    }

    // Verificar se o post existe
    const post = await db.get('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      console.log('Post não encontrado:', postId);
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    console.log('Inserindo comentário no banco de dados...');
    const result = await db.run(
      'INSERT INTO comments (post_id, user, comment, created_at) VALUES (?, ?, ?, datetime("now"))',
      [postId, user || "Anônimo", text]
    );
    console.log('Comentário inserido com sucesso:', result);

    const newComment = {
      id: result.lastID,
      post_id: postId,
      user: user || "Anônimo",
      comment: text,
      created_at: new Date().toISOString()
    };

    console.log('Retornando novo comentário:', newComment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Erro detalhado ao criar comentário:', error);
    res.status(500).json({ 
      message: 'Erro ao criar comentário',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
