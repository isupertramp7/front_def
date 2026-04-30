const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpiar tablas en orden
  await prisma.asistencia.deleteMany();
  await prisma.marcacion.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.horarioLaboral.deleteMany();

  // Horarios
  const horarioMañana = await prisma.horarioLaboral.create({
    data: {
      nombre: 'Turno Mañana',
      hora_entrada: '08:00',
      hora_salida: '17:00',
      dias_laborales: [1, 2, 3, 4, 5],
      minutos_tolerancia: 10,
      tipo_turno: 'fijo',
    },
  });

  const horarioTarde = await prisma.horarioLaboral.create({
    data: {
      nombre: 'Turno Tarde',
      hora_entrada: '14:00',
      hora_salida: '22:00',
      dias_laborales: [1, 2, 3, 4, 5, 6],
      minutos_tolerancia: 5,
      tipo_turno: 'fijo',
    },
  });

  // Usuarios
  const passHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const userRRHH = await prisma.usuario.create({
    data: {
      nombre: 'Ana García',
      correo: 'ana.garcia@marcaciongo.cl',
      password_hash: adminHash,
      rol: 'rrhh',
    },
  });

  const userEmp1 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Pérez',
      correo: 'carlos.perez@marcaciongo.cl',
      password_hash: passHash,
      rol: 'empleado',
    },
  });

  const userEmp2 = await prisma.usuario.create({
    data: {
      nombre: 'María López',
      correo: 'maria.lopez@marcaciongo.cl',
      password_hash: passHash,
      rol: 'empleado',
    },
  });

  const userSupervisor = await prisma.usuario.create({
    data: {
      nombre: 'Jorge Ramírez',
      correo: 'jorge.ramirez@marcaciongo.cl',
      password_hash: adminHash,
      rol: 'supervisor',
    },
  });

  // Empleados
  const emp1 = await prisma.empleado.create({
    data: {
      usuario_id: userEmp1.id,
      rut: '12.345.678-9',
      cargo: 'Analista TI',
      departamento: 'Tecnología',
      horario_id: horarioMañana.id,
    },
  });

  const emp2 = await prisma.empleado.create({
    data: {
      usuario_id: userEmp2.id,
      rut: '14.567.890-1',
      cargo: 'Asistente Administrativa',
      departamento: 'Administración',
      horario_id: horarioTarde.id,
    },
  });

  await prisma.empleado.create({
    data: {
      usuario_id: userRRHH.id,
      rut: '16.789.012-3',
      cargo: 'Jefa RRHH',
      departamento: 'Recursos Humanos',
      horario_id: horarioMañana.id,
    },
  });

  // Marcaciones últimos 5 días hábiles
  const hoy = new Date();
  for (let i = 4; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    if (fecha.getDay() === 0 || fecha.getDay() === 6) continue;

    // emp1 - entrada puntual
    const entrada1 = new Date(fecha);
    entrada1.setHours(8, 5, 0, 0);
    await prisma.marcacion.create({
      data: {
        empleado_id: emp1.id,
        tipo: 'entrada',
        fecha_hora: entrada1,
        latitud: -33.4569,
        longitud: -70.6483,
        zona_permitida: true,
        estado: 'aprobado',
      },
    });

    const salida1 = new Date(fecha);
    salida1.setHours(17, 2, 0, 0);
    await prisma.marcacion.create({
      data: {
        empleado_id: emp1.id,
        tipo: 'salida',
        fecha_hora: salida1,
        latitud: -33.4569,
        longitud: -70.6483,
        zona_permitida: true,
        estado: 'aprobado',
      },
    });

    // emp2 - un atraso
    const minutosAtraso = i === 2 ? 20 : 3;
    const entrada2 = new Date(fecha);
    entrada2.setHours(14, minutosAtraso, 0, 0);
    await prisma.marcacion.create({
      data: {
        empleado_id: emp2.id,
        tipo: 'entrada',
        fecha_hora: entrada2,
        latitud: -33.4569,
        longitud: -70.6483,
        zona_permitida: true,
        estado: 'aprobado',
      },
    });

    const salida2 = new Date(fecha);
    salida2.setHours(22, 10, 0, 0);
    await prisma.marcacion.create({
      data: {
        empleado_id: emp2.id,
        tipo: 'salida',
        fecha_hora: salida2,
        latitud: -33.4569,
        longitud: -70.6483,
        zona_permitida: true,
        estado: 'aprobado',
      },
    });

    // Registros asistencia
    await prisma.asistencia.upsert({
      where: { empleado_id_fecha: { empleado_id: emp1.id, fecha } },
      update: {},
      create: {
        empleado_id: emp1.id,
        fecha,
        horas_trabajadas: 8.95,
        horas_extra: 0,
        atraso: false,
      },
    });

    await prisma.asistencia.upsert({
      where: { empleado_id_fecha: { empleado_id: emp2.id, fecha } },
      update: {},
      create: {
        empleado_id: emp2.id,
        fecha,
        horas_trabajadas: i === 2 ? 7.83 : 8.12,
        horas_extra: i === 2 ? 0 : 0.17,
        atraso: i === 2,
        observacion: i === 2 ? 'Atraso de 20 minutos' : null,
      },
    });
  }

  console.log('Seed completado:');
  console.log('  Horarios: 2');
  console.log('  Usuarios: 4 (1 rrhh, 1 supervisor, 2 empleados)');
  console.log('  Empleados: 3');
  console.log('  Marcaciones: ~20');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
