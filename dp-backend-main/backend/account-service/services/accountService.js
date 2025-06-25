import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const cuentasPath = path.resolve('./data/cuentas.json');

let cuentas = [];

async function cargarCuentas() {
  try {
    const data = await fs.readFile(cuentasPath, 'utf-8');
    cuentas = JSON.parse(data);
  } catch {
    cuentas = [];
  }
}

await cargarCuentas();

export async function crearCuentaService({ userId, cvu, alias }) {
  try {
    const response = await axios.get(`http://localhost:3500/users/${userId}`);
    if (!response.data) {
      throw new Error('Usuario no encontrado');
    }
  } catch (err) {
    throw new Error('Usuario no encontrado');
  }

  const cuentaExistente = cuentas.find(c => c.cvu === cvu || c.alias === alias);
  if (cuentaExistente) {
    throw new Error('CVU o alias ya existente');
  }

  const nuevaCuenta = { userId, cvu, alias, saldo: 0, transacciones: [] };
  cuentas.push(nuevaCuenta);

  await fs.writeFile(cuentasPath, JSON.stringify(cuentas, null, 2));
}

// Obtener cuentas de un usuario
export async function obtenerCuentasPorUsuarioService(userId) {
  await cargarCuentas();
  const resultado = cuentas.filter(cuenta => String(cuenta.userId) === String(userId));
  if (resultado.length === 0) {
    throw new Error('No se encontraron cuentas para ese usuario');
  }
  return resultado;
}

// Agregar una transacción a una cuenta
export async function agregarTransaccionService(cuentaId, transaccion) {
  await cargarCuentas();
  const cuenta = cuentas.find(c => c.cvu === cuentaId || c.alias === cuentaId || c.id === cuentaId);
  if (!cuenta) throw new Error('Cuenta no encontrada');

  transaccion.id = (cuenta.transacciones.length + 1).toString();
  transaccion.fecha = new Date().toISOString();

  cuenta.transacciones.push(transaccion);

  // Actualizar saldo según tipo
  if (transaccion.tipo === 'depósito' || transaccion.tipo === 'transferencia') {
    cuenta.saldo += transaccion.monto;
  } else if (transaccion.tipo === 'retiro') {
    cuenta.saldo -= transaccion.monto;
  }

  await fs.writeFile(cuentasPath, JSON.stringify(cuentas, null, 2));
  return transaccion;
}

// Obtener transacciones de una cuenta
export async function obtenerTransaccionesService(cuentaId) {
  await cargarCuentas();
  const cuenta = cuentas.find(c => c.cvu === cuentaId || c.alias === cuentaId || c.id === cuentaId);
  if (!cuenta) throw new Error('Cuenta no encontrada');
  return cuenta.transacciones;
}

export async function transferirFondosService({ cuentaOrigenId, destino, monto, descripcion }) {
  await cargarCuentas();

  const cuentaOrigen = cuentas.find(c =>
    c.userId === cuentaOrigenId || c.cvu === cuentaOrigenId || c.alias === cuentaOrigenId
  );
  if (!cuentaOrigen) throw new Error('Cuenta de origen no encontrada');

  const cuentaDestino = cuentas.find(c =>
    c.cvu === destino || c.alias === destino
  );
  if (!cuentaDestino) throw new Error('Cuenta de destino no encontrada');

  if (cuentaOrigen.saldo < monto) throw new Error('Fondos insuficientes');

  const fecha = new Date().toISOString();

  // Actualizar saldos
  cuentaOrigen.saldo -= monto;
  cuentaDestino.saldo += monto;

  // Agregar transacción a cuenta origen
  cuentaOrigen.transacciones.push({
    id: (cuentaOrigen.transacciones.length + 1).toString(),
    tipo: 'retiro',
    monto,
    descripcion: descripcion || `Transferencia a ${cuentaDestino.alias || cuentaDestino.cvu}`,
    fecha
  });

  // Agregar transacción a cuenta destino
  cuentaDestino.transacciones.push({
    id: (cuentaDestino.transacciones.length + 1).toString(),
    tipo: 'transferencia',
    monto,
    descripcion: descripcion || `Transferencia recibida de ${cuentaOrigen.alias || cuentaOrigen.cvu}`,
    fecha
  });

  await fs.writeFile(cuentasPath, JSON.stringify(cuentas, null, 2));

  return {
    saldoFinal: cuentaOrigen.saldo,
    destino: cuentaDestino.alias || cuentaDestino.cvu
  };
}
