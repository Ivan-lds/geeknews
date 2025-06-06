import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database/config.js';
import {
  registerUser,
  loginUser,
  generateResetToken,
  resetPassword,
  authenticateToken,
  requireAdmin
} from './auth/auth.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para verificar se o banco está inicializado
const checkDatabase = (req, res, next) => {
  if (!db) {
    return res.status(503).json({ error: 'Serviço indisponível. Banco de dados não inicializado.' });
  }
  next();
};

// Inicializar banco de dados
let db;
initializeDatabase()
  .then(database => {
    db = database;
    console.log('Banco de dados inicializado com sucesso!');
  })
  .catch(error => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });

// Rotas de autenticação
app.post('/api/auth/register', checkDatabase, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await registerUser(db, { name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', checkDatabase, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await loginUser(db, { email, password });
    return res.json(result);
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/forgot-password', checkDatabase, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const result = await generateResetToken(db, email);
    return res.json(result);
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', checkDatabase, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    const result = await resetPassword(db, token, newPassword);
    return res.json(result);
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Rota protegida para obter informações do usuário
app.get('/api/auth/me', checkDatabase, authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Rota protegida para administradores
app.get('/api/admin/users', checkDatabase, authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, role, created_at FROM users');
    return res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota de verificação de saúde do servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 