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
    const { postId } = req.params;
    const { user } = req.query; // Opcional: usuário logado

    let comments;
    if (user) {
      comments = await db.all(`
        SELECT c.*, cr.reaction_type as user_reaction 
        FROM comments c 
        LEFT JOIN comment_reactions cr ON c.id = cr.comment_id AND cr.user = ? 
        WHERE c.post_id = ? 
        ORDER BY c.created_at DESC
      `, [user, postId]);
    } else {
      comments = await db.all(
        'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC',
        [postId]
      );
    }

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

    // Buscar o comentário recém-criado para obter o timestamp correto do banco
    const newComment = await db.get(
      'SELECT id, post_id, user, comment, created_at FROM comments WHERE id = ?',
      [result.lastID]
    );

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

// Rota para gerenciar reações (like/dislike) em comentários
app.post('/Comments/:commentId/reactions', async (req, res) => {
  const { commentId } = req.params;
  const { user, reactionType } = req.body;

  console.log('Recebendo requisição de reação:', {
    commentId,
    user,
    reactionType,
    body: req.body,
    headers: req.headers
  });

  if (!user) {
    console.log('Erro: usuário não fornecido');
    return res.status(400).json({ 
      error: 'Usuário não fornecido',
      details: 'É necessário estar logado para reagir aos comentários'
    });
  }

  if (!reactionType || !['like', 'dislike'].includes(reactionType)) {
    console.log('Erro: tipo de reação inválido:', reactionType);
    return res.status(400).json({ 
      error: 'Tipo de reação inválido',
      details: 'O tipo de reação deve ser "like" ou "dislike"'
    });
  }

  try {
    // Verificar se o comentário existe
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [commentId]);
    console.log('Comentário encontrado:', comment);

    if (!comment) {
      console.log('Erro: comentário não encontrado:', commentId);
      return res.status(404).json({ 
        error: 'Comentário não encontrado',
        details: `Comentário com ID ${commentId} não existe`
      });
    }

    // Verificar se já existe uma reação do usuário
    const existingReaction = await db.get(
      'SELECT * FROM comment_reactions WHERE comment_id = ? AND user = ?',
      [commentId, user]
    );
    console.log('Reação existente:', existingReaction);

    // Iniciar uma transação para garantir consistência
    await db.run('BEGIN TRANSACTION');

    try {
      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Se a reação for a mesma, remover
          console.log('Removendo reação existente');
          await db.run('DELETE FROM comment_reactions WHERE id = ?', [existingReaction.id]);
          
          // Atualizar contadores
          if (reactionType === 'like') {
            await db.run('UPDATE comments SET likes = likes - 1 WHERE id = ?', [commentId]);
          } else {
            await db.run('UPDATE comments SET dislikes = dislikes - 1 WHERE id = ?', [commentId]);
          }
        } else {
          // Se for uma reação diferente, atualizar
          console.log('Atualizando reação existente');
          await db.run(
            'UPDATE comment_reactions SET reaction_type = ? WHERE id = ?',
            [reactionType, existingReaction.id]
          );
          
          // Atualizar contadores
          if (existingReaction.reaction_type === 'like') {
            await db.run('UPDATE comments SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = ?', [commentId]);
          } else {
            await db.run('UPDATE comments SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = ?', [commentId]);
          }
        }
      } else {
        // Adicionar nova reação
        console.log('Adicionando nova reação');
        await db.run(
          'INSERT INTO comment_reactions (comment_id, user, reaction_type) VALUES (?, ?, ?)',
          [commentId, user, reactionType]
        );
        
        // Atualizar contadores
        if (reactionType === 'like') {
          await db.run('UPDATE comments SET likes = likes + 1 WHERE id = ?', [commentId]);
        } else {
          await db.run('UPDATE comments SET dislikes = dislikes + 1 WHERE id = ?', [commentId]);
        }
      }

      // Commit da transação
      await db.run('COMMIT');

      // Buscar comentário atualizado com reações
      const updatedComment = await db.get(`
        SELECT c.*, 
               (SELECT reaction_type FROM comment_reactions WHERE comment_id = c.id AND user = ?) as user_reaction
        FROM comments c 
        WHERE c.id = ?
      `, [user, commentId]);

      console.log('Comentário atualizado:', updatedComment);
      res.json(updatedComment);

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao processar reação:', error);
    console.error('Stack:', error.stack);
    console.error('Parâmetros:', { commentId, user, reactionType });
    res.status(500).json({ 
      error: 'Erro ao processar reação',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota para deletar um comentário (apenas admin)
app.delete('/Comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { user } = req.body;

  console.log('Tentativa de deletar comentário:', { commentId, user });

  if (!user) {
    console.log('Usuário não fornecido na requisição');
    return res.status(403).json({ error: 'Usuário não fornecido' });
  }

  if (user.role !== 'admin') {
    console.log('Usuário não é admin:', user);
    return res.status(403).json({ error: 'Acesso negado - Apenas administradores podem deletar comentários' });
  }

  try {
    console.log('Verificando se o comentário existe...');
    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [commentId]);
    
    if (!comment) {
      console.log('Comentário não encontrado:', commentId);
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    console.log('Deletando reações do comentário...');
    await db.run('DELETE FROM comment_reactions WHERE comment_id = ?', [commentId]);
    
    console.log('Deletando o comentário...');
    const result = await db.run('DELETE FROM comments WHERE id = ?', [commentId]);
    
    if (result.changes === 0) {
      console.log('Nenhum comentário foi deletado');
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    console.log('Comentário deletado com sucesso');
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
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
