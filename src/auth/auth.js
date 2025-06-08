import bcrypt from 'bcryptjs';
import { initializeDatabase } from '../database/config.js';

let db;

// Inicializar banco de dados
(async () => {
  try {
    db = await initializeDatabase();
    console.log('Banco de dados conectado');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
})();

// Funções auxiliares
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Funções principais
export const registerUser = async ({ name, email, password }) => {
  if (!db) throw new Error('Banco de dados não inicializado');

  // Verificar se o email já está cadastrado
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('Este email já está cadastrado');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(password);

  // Inserir usuário
  const result = await db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, 'user']
  );

  // Buscar usuário criado (sem a senha)
  const user = await db.get(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [result.lastID]
  );

  return { user };
};

export const loginUser = async ({ email, password }) => {
  if (!db) throw new Error('Banco de dados não inicializado');

  // Buscar usuário
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  // Verificar senha
  const isValidPassword = await comparePasswords(password, user.password);
  if (!isValidPassword) {
    throw new Error('Email ou senha inválidos');
  }

  // Remover senha do objeto do usuário
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword };
};

export const generateResetToken = async (email) => {
  if (!db) throw new Error('Banco de dados não inicializado');

  // Buscar usuário
  const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) {
    // Por segurança, não informamos se o email existe ou não
    return { message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.' };
  }

  // Gerar token simples (6 dígitos)
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

  // Salvar token no banco
  await db.run(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [resetToken, resetTokenExpires.toISOString(), user.id]
  );

  // Em produção, aqui você enviaria um email com o código
  // Por enquanto, retornamos o token para teste
  return {
    message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    resetToken // Em produção, remova esta linha
  };
};

export const resetPassword = async (token, newPassword) => {
  if (!db) throw new Error('Banco de dados não inicializado');

  // Buscar usuário pelo token
  const user = await db.get(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?',
    [token, new Date().toISOString()]
  );

  if (!user) {
    throw new Error('Código inválido ou expirado');
  }

  // Hash da nova senha
  const hashedPassword = await hashPassword(newPassword);

  // Atualizar senha e limpar token
  await db.run(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  return { message: 'Senha redefinida com sucesso' };
};

// Middleware para verificar se é admin
export const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  next();
};
