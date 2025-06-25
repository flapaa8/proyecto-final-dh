import fs from 'fs/promises';
import path from 'path';

const tarjetasPath = path.resolve('./data/tarjetas.json');

let tarjetas = [];

async function cargarTarjetas() {
  try {
    const data = await fs.readFile(tarjetasPath, 'utf-8');
    tarjetas = JSON.parse(data);
  } catch {
    tarjetas = [];
  }
}

await cargarTarjetas();

export async function getCardsByUser(cuentaId) {
  await cargarTarjetas();
  // filtro por cuentaId
  return tarjetas.filter(t => t.cuentaId === cuentaId);
}

export async function getCardById(cuentaId, cardId) {
  await cargarTarjetas();
  return tarjetas.find(t => t.cuentaId === cuentaId && t.id === cardId);
}

export async function addCard(card) {
  await cargarTarjetas();

  const nuevaCard = {
    id: (tarjetas.length + 1).toString(),
    ...card,
  };
  tarjetas.push(nuevaCard);
  await fs.writeFile(tarjetasPath, JSON.stringify(tarjetas, null, 2));
  return nuevaCard;
}

export async function updateCard(cuentaId, cardId, datos) {
  await cargarTarjetas();
  const index = tarjetas.findIndex(t => t.cuentaId === cuentaId && t.id === cardId);
  if (index === -1) return null;

  tarjetas[index] = { ...tarjetas[index], ...datos };
  await fs.writeFile(tarjetasPath, JSON.stringify(tarjetas, null, 2));
  return tarjetas[index];
}

export async function deleteCard(cuentaId, cardId) {
  await cargarTarjetas();
  const index = tarjetas.findIndex(t => t.cuentaId === cuentaId && t.id === cardId);
  if (index === -1) return false;

  tarjetas.splice(index, 1);
  await fs.writeFile(tarjetasPath, JSON.stringify(tarjetas, null, 2));
  return true;
}

