const router = require('express').Router();
const { registrar, historial, estadoHoy } = require('../controllers/marcaciones.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/', registrar);
router.get('/', historial);
router.get('/hoy', estadoHoy);

module.exports = router;
