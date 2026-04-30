const router = require('express').Router();
const { resumen, dashboardHoy, calcularDia } = require('../controllers/asistencia.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(verifyToken);

router.get('/', resumen);
router.get('/dashboard', requireRole('rrhh', 'supervisor'), dashboardHoy);
router.post('/calcular', requireRole('rrhh', 'supervisor'), calcularDia);

module.exports = router;
