import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Configurações do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';
const JWT_EXPIRES_IN = '24h';
const RESET_TOKEN_EXPIRES_IN = '1h';

// Funções auxiliares
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Funções principais
export const registerUser = async (db, { name, email, password }) => {
  // Verificar se o email já está cadastrado
  const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(password);

  // Inserir usuário
  const result = await db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  // Buscar usuário criado (sem a senha)
  const user = await db.get(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [result.lastID]
  );

  // Gerar token
  const token = generateToken(user);

  return { user, token };
};

export const loginUser = async (db, { email, password }) => {
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

  // Gerar token
  const token = generateToken(user);

  return { user: userWithoutPassword, token };
};

export const generateResetToken = async (db, email) => {
  // Buscar usuário
  const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (!user) {
    // Por segurança, não informamos se o email existe ou não
    return { message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.' };
  }

  // Gerar token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

  // Salvar token no banco
  await db.run(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [resetToken, resetTokenExpires.toISOString(), user.id]
  );

  // Em produção, aqui você enviaria um email com o link de redefinição
  // Por enquanto, retornamos o token para teste
  return {
    message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    resetToken // Em produção, remova esta linha
  };
};

export const resetPassword = async (db, token, newPassword) => {
  // Buscar usuário pelo token
  const user = await db.get(
    'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?',
    [token, new Date().toISOString()]
  );

  if (!user) {
    throw new Error('Token inválido ou expirado');
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

// Middleware de autenticação
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Middleware de verificação de admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}; 