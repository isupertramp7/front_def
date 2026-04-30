const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listar(req, res) {
  const horarios = await prisma.horarioLaboral.findMany({ orderBy: { id: 'asc' } });
  res.json(horarios);
}

async function obtener(req, res) {
  const horario = await prisma.horarioLaboral.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!horario) return res.status(404).json({ error: 'Horario no encontrado' });
  res.json(horario);
}

async function crear(req, res) {
  const { nombre, hora_entrada, hora_salida, dias_laborales, minutos_tolerancia, tipo_turno } = req.body;
  const horario = await prisma.horarioLaboral.create({
    data: { nombre, hora_entrada, hora_salida, dias_laborales, minutos_tolerancia: minutos_tolerancia || 5, tipo_turno: tipo_turno || 'fijo' },
  });
  res.status(201).json(horario);
}

async function actualizar(req, res) {
  const id = parseInt(req.params.id);
  const horario = await prisma.horarioLaboral.update({ where: { id }, data: req.body });
  res.json(horario);
}

async function eliminar(req, res) {
  const id = parseInt(req.params.id);
  const enUso = await prisma.empleado.count({ where: { horario_id: id } });
  if (enUso > 0) return res.status(409).json({ error: 'Horario en uso por empleados activos' });
  await prisma.horarioLaboral.delete({ where: { id } });
  res.json({ message: 'Horario eliminado' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
