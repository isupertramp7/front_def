-- Marcación GO - Datos de prueba
-- Ejecutar DESPUÉS de prisma migrate deploy

-- Horarios
INSERT INTO horarios_laborales (nombre, hora_entrada, hora_salida, dias_laborales, minutos_tolerancia, tipo_turno, creado_en)
VALUES
  ('Turno Mañana', '08:00', '17:00', ARRAY[1,2,3,4,5], 10, 'fijo', NOW()),
  ('Turno Tarde',  '14:00', '22:00', ARRAY[1,2,3,4,5,6], 5, 'fijo', NOW());

-- Usuarios (passwords: admin123 para rrhh/supervisor, password123 para empleados)
INSERT INTO usuarios (nombre, correo, password_hash, rol, activo, creado_en, actualizado_en)
VALUES
  ('Ana García',    'ana.garcia@marcaciongo.cl',    '$2a$10$rJfMUaVh9QJB5CJZL7kX9.V3dOJX0YJZrJLLH0WrQRiUX8eKkzSmK', 'rrhh',       true, NOW(), NOW()),
  ('Jorge Ramírez', 'jorge.ramirez@marcaciongo.cl', '$2a$10$rJfMUaVh9QJB5CJZL7kX9.V3dOJX0YJZrJLLH0WrQRiUX8eKkzSmK', 'supervisor', true, NOW(), NOW()),
  ('Carlos Pérez',  'carlos.perez@marcaciongo.cl',  '$2a$10$V0Z1Q1K0Cv2J.R2vj6bkVe0b6PJWB4QaVpZMeKBqyMLCH2cAXBVdW', 'empleado',   true, NOW(), NOW()),
  ('María López',   'maria.lopez@marcaciongo.cl',   '$2a$10$V0Z1Q1K0Cv2J.R2vj6bkVe0b6PJWB4QaVpZMeKBqyMLCH2cAXBVdW', 'empleado',   true, NOW(), NOW());

-- Empleados
INSERT INTO empleados (usuario_id, rut, cargo, departamento, horario_id, creado_en)
SELECT u.id, '16.789.012-3', 'Jefa RRHH',              'Recursos Humanos', h.id, NOW()
  FROM usuarios u, horarios_laborales h WHERE u.correo = 'ana.garcia@marcaciongo.cl' AND h.nombre = 'Turno Mañana';

INSERT INTO empleados (usuario_id, rut, cargo, departamento, horario_id, creado_en)
SELECT u.id, '15.678.901-2', 'Supervisor TI',           'Tecnología',       h.id, NOW()
  FROM usuarios u, horarios_laborales h WHERE u.correo = 'jorge.ramirez@marcaciongo.cl' AND h.nombre = 'Turno Mañana';

INSERT INTO empleados (usuario_id, rut, cargo, departamento, horario_id, creado_en)
SELECT u.id, '12.345.678-9', 'Analista TI',             'Tecnología',       h.id, NOW()
  FROM usuarios u, horarios_laborales h WHERE u.correo = 'carlos.perez@marcaciongo.cl' AND h.nombre = 'Turno Mañana';

INSERT INTO empleados (usuario_id, rut, cargo, departamento, horario_id, creado_en)
SELECT u.id, '14.567.890-1', 'Asistente Administrativa','Administración',   h.id, NOW()
  FROM usuarios u, horarios_laborales h WHERE u.correo = 'maria.lopez@marcaciongo.cl' AND h.nombre = 'Turno Tarde';

-- Marcaciones últimos 5 días hábiles (Carlos y María)
DO $$
DECLARE
  emp_carlos INT;
  emp_maria  INT;
  d          DATE;
  i          INT;
BEGIN
  SELECT id INTO emp_carlos FROM empleados e JOIN usuarios u ON e.usuario_id = u.id WHERE u.correo = 'carlos.perez@marcaciongo.cl';
  SELECT id INTO emp_maria  FROM empleados e JOIN usuarios u ON e.usuario_id = u.id WHERE u.correo = 'maria.lopez@marcaciongo.cl';

  FOR i IN 0..4 LOOP
    d := CURRENT_DATE - i;
    IF EXTRACT(DOW FROM d) IN (0,6) THEN CONTINUE; END IF;

    -- Carlos: entrada puntual
    INSERT INTO marcaciones (empleado_id, tipo, fecha_hora, latitud, longitud, zona_permitida, estado, creado_en)
    VALUES (emp_carlos, 'entrada', d + TIME '08:05:00', -33.4569, -70.6483, true, 'aprobado', NOW());
    INSERT INTO marcaciones (empleado_id, tipo, fecha_hora, latitud, longitud, zona_permitida, estado, creado_en)
    VALUES (emp_carlos, 'salida',  d + TIME '17:02:00', -33.4569, -70.6483, true, 'aprobado', NOW());

    -- María: atraso en día i=2
    INSERT INTO marcaciones (empleado_id, tipo, fecha_hora, latitud, longitud, zona_permitida, estado, creado_en)
    VALUES (emp_maria, 'entrada', d + (CASE WHEN i=2 THEN TIME '14:20:00' ELSE TIME '14:03:00' END), -33.4569, -70.6483, true, 'aprobado', NOW());
    INSERT INTO marcaciones (empleado_id, tipo, fecha_hora, latitud, longitud, zona_permitida, estado, creado_en)
    VALUES (emp_maria, 'salida',  d + TIME '22:10:00', -33.4569, -70.6483, true, 'aprobado', NOW());

    -- Asistencia
    INSERT INTO asistencia (empleado_id, fecha, horas_trabajadas, horas_extra, atraso, creado_en)
    VALUES (emp_carlos, d, 8.95, 0, false, NOW())
    ON CONFLICT (empleado_id, fecha) DO NOTHING;

    INSERT INTO asistencia (empleado_id, fecha, horas_trabajadas, horas_extra, atraso, observacion, creado_en)
    VALUES (emp_maria, d,
      CASE WHEN i=2 THEN 7.83 ELSE 8.12 END,
      CASE WHEN i=2 THEN 0   ELSE 0.12 END,
      CASE WHEN i=2 THEN true ELSE false END,
      CASE WHEN i=2 THEN 'Atraso de 20 minutos' ELSE NULL END,
      NOW())
    ON CONFLICT (empleado_id, fecha) DO NOTHING;
  END LOOP;
END $$;
