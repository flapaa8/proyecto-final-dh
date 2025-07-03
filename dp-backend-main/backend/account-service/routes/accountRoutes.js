import express from 'express';
import {
  crearCuentaController,
  obtenerCuentasPorUsuarioController,
  obtenerActividadesPorUsuarioController, 
  agregarTransaccionController,
  obtenerTransaccionesController,
  transferirFondosController
} from '../controllers/accountControllers.js';

import { validarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Crear cuenta
router.post('/create', crearCuentaController);

// Obtener cuentas por usuario
router.get('/user/:userId', validarToken, obtenerCuentasPorUsuarioController);

// Obtener actividades por usuario
router.get('/:userId/activity', validarToken, obtenerActividadesPorUsuarioController);

// Agregar transacción a una cuenta
router.post('/:cuentaId/transactions', validarToken, agregarTransaccionController);

// Obtener transacciones de una cuenta
router.get('/:cuentaId/transactions', validarToken, obtenerTransaccionesController);

// Transferir fondos entre cuentas
router.post('/:cuentaId/transferences', validarToken, transferirFondosController);

export default router;






