import express from 'express';
import {
  obtenerTarjetas,
  obtenerTarjetaPorId,
  crearTarjeta,
  editarTarjeta,
  eliminarTarjeta,
} from './controllers/cards.controller.js'; // <--- sin ../, está en subcarpeta controllers

const router = express.Router();

router.get('/:userId', obtenerTarjetas);
router.get('/:userId/:cardId', obtenerTarjetaPorId);
router.post('/:userId', crearTarjeta);
router.put('/:userId/:cardId', editarTarjeta);
router.delete('/:userId/:cardId', eliminarTarjeta);

export default router;
