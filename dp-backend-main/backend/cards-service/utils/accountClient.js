import fetch from 'node-fetch';

const ACCOUNT_SERVICE_URL = 'http://localhost:3600';

export async function obtenerCuentaPorUsuarioId(userId) {
  const response = await fetch(`${ACCOUNT_SERVICE_URL}/accounts/user/${userId}`);
  if (!response.ok) {
    throw new Error(`Error al obtener cuenta: ${response.statusText}`);
  }
  const cuentas = await response.json(); // devuelve array
  return cuentas;
}

