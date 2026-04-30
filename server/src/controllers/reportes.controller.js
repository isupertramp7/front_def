const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { parseISO } = require('date-fns');

const prisma = new PrismaClient();

async function listar(req, res) {
  const reportes = await prisma.reporte.findMany({
    include: { usuario: { select: { nombre: true } } },
    orderBy: { fecha_generacion: 'desc' },
    take: 50,
  });
  res.json(reportes);
}

async function generar(req, res) {
  const { fecha_inicio, fecha_fin, tipo_reporte, formato, empleado_id } = req.body;

  if (!fecha_inicio || !fecha_fin || !formato) {
    return res.status(400).json({ error: 'fecha_inicio, fecha_fin y formato requeridos' });
  }

  const where = {
    fecha: { gte: parseISO(fecha_inicio), lte: parseISO(fecha_fin) },
    ...(empleado_id && { empleado_id: parseInt(empleado_id) }),
  };

  const datos = await prisma.asistencia.findMany({
    where,
    include: {
      empleado: {
        include: { usuario: { select: { nombre: true } } },
      },
    },
    orderBy: [{ empleado_id: 'asc' }, { fecha: 'asc' }],
  });

  const reporte = await prisma.reporte.create({
    data: {
      generado_por: req.user.id,
      fecha_inicio: parseISO(fecha_inicio),
      fecha_fin: parseISO(fecha_fin),
      tipo_reporte: tipo_reporte || 'asistencia',
      formato,
    },
  });

  if (formato === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencia');

    sheet.columns = [
      { header: 'Empleado', key: 'nombre', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Horas Trabajadas', key: 'horas_trabajadas', width: 18 },
      { header: 'Horas Extra', key: 'horas_extra', width: 14 },
      { header: 'Atraso', key: 'atraso', width: 10 },
      { header: 'Observación', key: 'observacion', width: 30 },
    ];

    datos.forEach(d => {
      sheet.addRow({
        nombre: d.empleado.usuario.nombre,
        fecha: new Date(d.fecha).toLocaleDateString('es-CL'),
        horas_trabajadas: d.horas_trabajadas,
        horas_extra: d.horas_extra,
        atraso: d.atraso ? 'Sí' : 'No',
        observacion: d.observacion || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${reporte.id}.xlsx`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  if (formato === 'pdf') {
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${reporte.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Marcación GO - Reporte de Asistencia', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Período: ${fecha_inicio} → ${fecha_fin}`);
    doc.moveDown();

    datos.forEach(d => {
      doc.fontSize(10).text(
        `${d.empleado.usuario.nombre} | ${new Date(d.fecha).toLocaleDateString('es-CL')} | ` +
        `${d.horas_trabajadas}h | Extra: ${d.horas_extra}h | Atraso: ${d.atraso ? 'Sí' : 'No'}` +
        `${d.observacion ? ` | ${d.observacion}` : ''}`
      );
    });

    doc.end();
    return;
  }

  res.status(400).json({ error: 'Formato no soportado' });
}

module.exports = { listar, generar };
