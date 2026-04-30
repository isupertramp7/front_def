const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay } = require('date-fns');

const prisma = new PrismaClient();

async function registrar(req, res) {
  const { tipo, latitud, longitud, zona_permitida } = req.body;
  if (!tipo || !['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser entrada o salida' });
  }

  const empleado = await prisma.empleado.findUnique({ where: { usuario_id: req.user.id } });
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

  // Evitar duplicados del mismo tipo en el mismo día
  const hoy = new Date();
  const duplicado = await prisma.marcacion.findFirst({
    where: {
      empleado_id: empleado.id,
      tipo,
      fecha_hora: { gte: startOfDay(hoy), lte: endOfDay(hoy) },
    },
  });

  if (duplicado) {
    return res.status(409).json({ error: `Ya existe una marcación de ${tipo} para hoy` });
  }

  const marcacion = await prisma.marcacion.create({
    data: {
      empleado_id: empleado.id,
      tipo,
      latitud: latitud ? parseFloat(latitud) : null,
      longitud: longitud ? parseFloat(longitud) : null,
      zona_permitida: zona_permitida ?? false,
      estado: 'pendiente',
    },
  });

  res.status(201).json(marcacion);
}

async function historial(req, res) {
  const { desde, hasta, empleado_id } = req.query;
  const esAdmin = ['rrhh', 'supervisor'].includes(req.user.rol);

  let empId;
  if (esAdmin && empleado_id) {
    empId = parseInt(empleado_id);
  } else {
    const empleado = await prisma.empleado.findUnique({ where: { usuario_id: req.user.id } });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    empId = empleado.id;
  }

  const where = { empleado_id: empId };
  if (desde || hasta) {
    where.fecha_hora = {};
    if (desde) where.fecha_hora.gte = new Date(desde);
    if (hasta) where.fecha_hora.lte = new Date(hasta);
  }

  const marcaciones = await prisma.marcacion.findMany({
    where,
    orderBy: { fecha_hora: 'desc' },
    take: 100,
  });

  res.json(marcaciones);
}

async function estadoHoy(req, res) {
  const empleado = await prisma.empleado.findUnique({ where: { usuario_id: req.user.id } });
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

  const hoy = new Date();
  const marcacionesHoy = await prisma.marcacion.findMany({
    where: {
      empleado_id: empleado.id,
      fecha_hora: { gte: startOfDay(hoy), lte: endOfDay(hoy) },
    },
    orderBy: { fecha_hora: 'asc' },
  });

  const entrada = marcacionesHoy.find(m => m.tipo === 'entrada');
  const salida = marcacionesHoy.find(m => m.tipo === 'salida');

  res.json({ entrada, salida, marcacionesHoy });
}

module.exports = { registrar, historial, estadoHoy };
