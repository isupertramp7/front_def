const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const marcacionesRoutes = require('./routes/marcaciones.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const horariosRoutes = require('./routes/horarios.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/marcaciones', marcacionesRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/reportes', reportesRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
