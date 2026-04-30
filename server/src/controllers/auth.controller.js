const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');

const prisma = new PrismaClient();

async function login(req, res) {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, usuario.password_hash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const payload = { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: usuario.id });

  res.json({ accessToken, refreshToken, usuario: payload });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken requerido' });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });
    if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Usuario no válido' });

    const payload = { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre };
    const accessToken = signAccessToken(payload);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
}

async function logout(req, res) {
  res.json({ message: 'Sesión cerrada' });
}

async function me(req, res) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: { id: true, nombre: true, correo: true, rol: true, activo: true },
  });
  res.json(usuario);
}

module.exports = { login, refresh, logout, me };
