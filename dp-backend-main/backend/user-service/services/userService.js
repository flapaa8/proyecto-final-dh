import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';  // <-- Import para hacer llamadas HTTP
import { generarAlias } from '../utils/generarAlias.js';
import { generarCVU } from '../utils/generarCVU.js';

const usuariosPath = path.resolve('./data/usuarios.json');
const JWT_SECRET = 'clave_secreta_ultrasegura';

let usuarios = [];

async function cargarUsuarios() {
  try {
    const data = await fs.readFile(usuariosPath, 'utf-8');
    usuarios = JSON.parse(data);
  } catch {
    usuarios = [];
  }
}

await cargarUsuarios();

export async function register({ NyAP, dni, email, telefono, password }) {
  if (!NyAP || !dni || !email || !telefono || !password) {
    const error = new Error('Faltan datos');
    error.status = 400;
    throw error;
  }

  const usuarioExistente = usuarios.find(u => u.dni === dni || u.email === email || u.telefono === telefono);
  if (usuarioExistente) {
    const error = new Error('Usuario ya existe');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const cvu = generarCVU();
  const alias = await generarAlias();

  const nuevoUsuario = {
    id: Date.now().toString(),
    NyAP,
    dni,
    email,
    telefono,
    contraseña: hashedPassword,
    cvu,
    alias,
  };

  usuarios.push(nuevoUsuario);
  await fs.writeFile(usuariosPath, JSON.stringify(usuarios));

  // Llamada al Account Service para crear la cuenta asociada
  try {
    const response = await fetch('http://localhost:3600/accounts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: nuevoUsuario.id,
        cvu: nuevoUsuario.cvu,
        alias: nuevoUsuario.alias,
      }),
    });

    if (!response.ok) {
      console.error('Error creando cuenta en Account Service');
    }
  } catch (err) {
    console.error('Error comunicándose con Account Service:', err);
  }

  return { message: 'Usuario registrado', cvu, alias };
}

export async function login({ email, password }) {
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.status = 400;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, usuario.contraseña);
  if (!validPassword) {
    const error = new Error('Contraseña incorrecta');
    error.status = 400;
    throw error;
  }

  const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
  return { message: 'Login exitoso', token };
}
export async function transferencia(userId, { destino, monto, descripcion }) {
  const cuentaOrigen = await obtenerCuenta(userId);

  if (!cuentaOrigen) {
    const error = new Error('Cuenta de origen no encontrada');
    error.status = 404;
    throw error;
  }

  if (cuentaOrigen.saldo < monto) {
    const error = new Error('Fondos insuficientes');
    error.status = 410;
    throw error;
  }

  const response = await fetch(`http://localhost:3600/accounts/${cuentaOrigen.id}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destino,
      monto,
      descripcion,
    }),
  });

  if (!response.ok) {
    const error = new Error('Error al realizar la transferencia');
    error.status = response.status;
    throw error;
  }

  return { message: 'Transferencia realizada con éxito' };
}

async function obtenerCuenta(userId) {
  const res = await fetch(`http://localhost:3600/accounts/user/${userId}`);
  if (!res.ok) return null;

  const cuentas = await res.json();
  return cuentas[0]; // asumimos una sola cuenta por usuario
}

