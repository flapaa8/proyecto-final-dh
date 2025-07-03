import {
  crearCuentaService,
  obtenerCuentasPorUsuarioService,
  obtenerActividadesPorUsuarioService,
  agregarTransaccionService,
  obtenerTransaccionesService,
  transferirFondosService
} from '../services/accountService.js';

// Crear cuenta
export async function crearCuentaController(req, res) {
  try {
    const { userId, cvu, alias } = req.body;
    await crearCuentaService({ userId, cvu, alias });
    res.status(201).json({ mensaje: 'Cuenta creada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Obtener cuentas por usuario
export async function obtenerCuentasPorUsuarioController(req, res) {
  try {
    const userId = req.params.userId;
    const cuentas = await obtenerCuentasPorUsuarioService(userId);
    res.json(cuentas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Obtener actividades por usuario
export async function obtenerActividadesPorUsuarioController(req, res) {
  try {
    const userId = req.params.userId;
    const actividades = await obtenerActividadesPorUsuarioService(userId);
    res.json(actividades);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Agregar transacción
export async function agregarTransaccionController(req, res) {
  try {
    const cuentaId = req.params.cuentaId;
    const transaccion = req.body;
    const resultado = await agregarTransaccionService(cuentaId, transaccion);
    res.status(201).json({ mensaje: 'Transacción agregada', transaccion: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Obtener transacciones
export async function obtenerTransaccionesController(req, res) {
  try {
    const cuentaId = req.params.cuentaId;
    const transacciones = await obtenerTransaccionesService(cuentaId);
    res.json(transacciones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Transferir fondos
export async function transferirFondosController(req, res) {
  try {
    const cuentaOrigenId = req.params.cuentaId;
    const { destino, monto, descripcion } = req.body;
    const resultado = await transferirFondosService({
      cuentaOrigenId,
      destino,
      monto,
      descripcion
    });
    res.status(200).json({
      mensaje: 'Transferencia realizada con éxito',
      resultado
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



