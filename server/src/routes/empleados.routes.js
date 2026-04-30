const router = require('express').Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/empleados.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(verifyToken);
router.use(requireRole('rrhh', 'supervisor'));

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
