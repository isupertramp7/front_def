const router = require('express').Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/horarios.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(verifyToken);

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', requireRole('rrhh', 'supervisor'), crear);
router.put('/:id', requireRole('rrhh', 'supervisor'), actualizar);
router.delete('/:id', requireRole('rrhh', 'supervisor'), eliminar);

module.exports = router;
