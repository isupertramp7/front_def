const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function listar(req, res) {
  const empleados = await prisma.empleado.findMany({
    include: {
      usuario: { select: { id: true, nombre: true, correo: true, rol: true, activo: true } },
      horario: { select: { nombre: true, hora_entrada: true, hora_salida: true } },
    },
    orderBy: { id: 'asc' },
  });
  res.json(empleados);
}

async function obtener(req, res) {
  const empleado = await prisma.empleado.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      usuario: { select: { nombre: true, correo: true, rol: true, activo: true } },
      horario: true,
    },
  });
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json(empleado);
}

async function crear(req, res) {
  const { nombre, correo, password, rol, rut, cargo, departamento, horario_id } = req.body;

  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) return res.status(409).json({ error: 'Correo ya registrado' });

  const rutExiste = await prisma.empleado.findUnique({ where: { rut } });
  if (rutExiste) return res.status(409).json({ error: 'RUT ya registrado' });

  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: { nombre, correo, password_hash, rol: rol || 'empleado' },
  });

  const empleado = await prisma.empleado.create({
    data: { usuario_id: usuario.id, rut, cargo, departamento, horario_id: parseInt(horario_id) },
    include: { usuario: { select: { nombre: true, correo: true, rol: true } }, horario: true },
  });

  res.status(201).json(empleado);
}

async function actualizar(req, res) {
  const id = parseInt(req.params.id);
  const { nombre, correo, rol, activo, cargo, departamento, horario_id } = req.body;

  const empleado = await prisma.empleado.findUnique({ where: { id } });
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

  if (nombre || correo || rol !== undefined || activo !== undefined) {
    await prisma.usuario.update({
      where: { id: empleado.usuario_id },
      data: { ...(nombre && { nombre }), ...(correo && { correo }), ...(rol && { rol }), ...(activo !== undefined && { activo }) },
    });
  }

  const actualizado = await prisma.empleado.update({
    where: { id },
    data: {
      ...(cargo && { cargo }),
      ...(departamento && { departamento }),
      ...(horario_id && { horario_id: parseInt(horario_id) }),
    },
    include: { usuario: { select: { nombre: true, correo: true, rol: true, activo: true } }, horario: true },
  });

  res.json(actualizado);
}

async function eliminar(req, res) {
  const id = parseInt(req.params.id);
  const empleado = await prisma.empleado.findUnique({ where: { id } });
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

  // Desactivar en vez de eliminar para preservar historial
  await prisma.usuario.update({ where: { id: empleado.usuario_id }, data: { activo: false } });
  res.json({ message: 'Empleado desactivado' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
