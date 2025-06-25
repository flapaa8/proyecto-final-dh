import express from 'express';
import {
  crearCuentaController,
  obtenerCuentasPorUsuarioController,
  agregarTransaccionController,
  obtenerTransaccionesController,
  transferirFondosController // 👈 nuevo
} from '../controllers/accountControllers.js';

const router = express.Router();

router.post('/create', crearCuentaController);

router.get('/user/:userId', obtenerCuentasPorUsuarioController);

router.post('/:cuentaId/transactions', agregarTransaccionController);

router.get('/:cuentaId/transactions', obtenerTransaccionesController);

// NUEVO ENDPOINT 👇
router.post('/:cuentaId/transferences', transferirFondosController);

export default router;




