const router = require('express').Router();
const { listar, generar } = require('../controllers/reportes.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(verifyToken);
router.use(requireRole('rrhh', 'supervisor'));

router.get('/', listar);
router.post('/generar', generar);

module.exports = router;
