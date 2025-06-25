import {
  getCardsByUser,
  getCardById,
  addCard,
  updateCard,
  deleteCard,
} from '../cards.model.js'; 


import { obtenerCuentaPorUsuarioId } from '../utils/accountClient.js';

export const obtenerTarjetas = async (req, res) => {
  try {
    const cuentas = await obtenerCuentaPorUsuarioId(req.params.userId);
    if (!cuentas || cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const cuenta = cuentas[0];

    const cards = await getCardsByUser(cuenta.id);
    const cardsOcultas = cards.map(c => ({
      ...c,
      numero: `•••• •••• •••• ${c.numero.slice(-4)}`,
      codigo: '•••',
    }));

    res.json(cardsOcultas);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error.message);
    res.status(500).json({ error: 'Error al obtener tarjetas' });
  }
};

export const obtenerTarjetaPorId = async (req, res) => {
  try {
    const cuentas = await obtenerCuentaPorUsuarioId(req.params.userId);
    if (!cuentas || cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const cuenta = cuentas[0];

    const tarjeta = await getCardById(cuenta.id, req.params.cardId);
    if (!tarjeta) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json(tarjeta);
  } catch (error) {
    console.error('Error al obtener tarjeta:', error.message);
    res.status(500).json({ error: 'Error al obtener la tarjeta' });
  }
};

export const crearTarjeta = async (req, res) => {
  const { numero, nombre, vencimiento, codigo } = req.body;

  if (!numero || !nombre || !vencimiento || !codigo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const cuentas = await obtenerCuentaPorUsuarioId(req.params.userId);
    if (!cuentas || cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const cuenta = cuentas[0];

    const nuevaTarjeta = await addCard({
      cuentaId: cuenta.id,
      numero,
      nombre,
      vencimiento,
      codigo,
    });

    res.status(201).json(nuevaTarjeta);
  } catch (error) {
    console.error('Error al agregar tarjeta:', error.message);
    res.status(500).json({ error: 'Error al agregar la tarjeta' });
  }
};

export const editarTarjeta = async (req, res) => {
  try {
    const cuentas = await obtenerCuentaPorUsuarioId(req.params.userId);
    if (!cuentas || cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const cuenta = cuentas[0];

    const tarjetaEditada = await updateCard(cuenta.id, req.params.cardId, req.body);
    if (!tarjetaEditada) return res.status(404).json({ error: 'Tarjeta no encontrada' });
    res.json(tarjetaEditada);
  } catch (error) {
    console.error('Error al editar tarjeta:', error.message);
    res.status(500).json({ error: 'Error al editar la tarjeta' });
  }
};

export const eliminarTarjeta = async (req, res) => {
  try {
    const cuentas = await obtenerCuentaPorUsuarioId(req.params.userId);
    if (!cuentas || cuentas.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    const cuenta = cuentas[0];

    const eliminado = await deleteCard(cuenta.id, req.params.cardId);
    if (!eliminado) return res.status(404).json({ error: 'Tarjeta no encontrada' });

    res.json({ mensaje: 'Tarjeta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error.message);
    res.status(500).json({ error: 'Error al eliminar la tarjeta' });
  }
};

