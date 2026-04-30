const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, parseISO } = require('date-fns');
const { calcularHorasTrabajadas, calcularAtraso, calcularHorasExtra } = require('../utils/asistencia.utils');

const prisma = new PrismaClient();

async function resumen(req, res) {
  const { desde, hasta, empleado_id } = req.query;
  const esAdmin = ['rrhh', 'supervisor'].includes(req.user.rol);

  let where = {};
  if (esAdmin && empleado_id) {
    where.empleado_id = parseInt(empleado_id);
  } else if (!esAdmin) {
    const emp = await prisma.empleado.findUnique({ where: { usuario_id: req.user.id } });
    if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' });
    where.empleado_id = emp.id;
  }

  if (desde) where.fecha = { ...(where.fecha || {}), gte: parseISO(desde) };
  if (hasta) where.fecha = { ...(where.fecha || {}), lte: parseISO(hasta) };

  const registros = await prisma.asistencia.findMany({
    where,
    include: { empleado: { include: { usuario: { select: { nombre: true } } } } },
    orderBy: { fecha: 'desc' },
  });

  res.json(registros);
}

async function dashboardHoy(req, res) {
  const hoy = new Date();
  const inicioHoy = startOfDay(hoy);
  const finHoy = endOfDay(hoy);

  const totalEmpleados = await prisma.empleado.count({ where: { usuario: { activo: true } } });

  const marcacionesHoy = await prisma.marcacion.findMany({
    where: { fecha_hora: { gte: inicioHoy, lte: finHoy }, tipo: 'entrada' },
    distinct: ['empleado_id'],
  });

  const asistenciaHoy = await prisma.asistencia.findMany({
    where: { fecha: inicioHoy },
  });

  const presentes = marcacionesHoy.length;
  const ausentes = totalEmpleados - presentes;
  const atrasados = asistenciaHoy.filter(a => a.atraso).length;

  res.json({ totalEmpleados, presentes, ausentes, atrasados, fecha: hoy });
}

async function calcularDia(req, res) {
  const { empleado_id, fecha } = req.body;
  if (!empleado_id || !fecha) return res.status(400).json({ error: 'empleado_id y fecha requeridos' });

  const fechaObj = parseISO(fecha);
  const emp = await prisma.empleado.findUnique({
    where: { id: parseInt(empleado_id) },
    include: { horario: true },
  });
  if (!emp) return res.status(404).json({ error: 'Empleado no encontrado' });

  const marcaciones = await prisma.marcacion.findMany({
    where: {
      empleado_id: emp.id,
      fecha_hora: { gte: startOfDay(fechaObj), lte: endOfDay(fechaObj) },
    },
    orderBy: { fecha_hora: 'asc' },
  });

  const entrada = marcaciones.find(m => m.tipo === 'entrada');
  const salida = marcaciones.find(m => m.tipo === 'salida');

  if (!entrada) return res.status(400).json({ error: 'Sin marcación de entrada para esa fecha' });

  const horasTrabajadas = salida ? calcularHorasTrabajadas(entrada.fecha_hora, salida.fecha_hora) : 0;
  const horasExtra = calcularHorasExtra(horasTrabajadas);
  const atraso = calcularAtraso(entrada.fecha_hora, emp.horario.hora_entrada, emp.horario.minutos_tolerancia);

  const asistencia = await prisma.asistencia.upsert({
    where: { empleado_id_fecha: { empleado_id: emp.id, fecha: fechaObj } },
    update: { horas_trabajadas: horasTrabajadas, horas_extra: horasExtra, atraso },
    create: { empleado_id: emp.id, fecha: fechaObj, horas_trabajadas: horasTrabajadas, horas_extra: horasExtra, atraso },
  });

  res.json(asistencia);
}

module.exports = { resumen, dashboardHoy, calcularDia };
