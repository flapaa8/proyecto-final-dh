import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; 
import { generarAlias } from '../utils/generarAlias.js';
import { generarCVU } from '../utils/generarCVU.js';

const usuariosPath = path.resolve('./data/usuarios.json');
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_ultrasegura';
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3600';

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

  const usuarioExistente = usuarios.find(
    u => u.dni === dni || u.email === email || u.telefono === telefono
  );
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
  await fs.writeFile(usuariosPath, JSON.stringify(usuarios, null, 2));

  // Crear la cuenta en el Account Service
  try {
    const response = await fetch(`${ACCOUNT_SERVICE_URL}/accounts/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: nuevoUsuario.id,
        cvu: nuevoUsuario.cvu,
        alias: nuevoUsuario.alias,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error creando cuenta en Account Service', response.status, text);
    }
  } catch (err) {
    console.error('Error comunicándose con Account Service:', err);
  }

 
  const accessToken = jwt.sign(
    { id: nuevoUsuario.id, email: nuevoUsuario.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const usuarioSinPassword = { ...nuevoUsuario };
  delete usuarioSinPassword.contraseña;

  return {
    message: 'Usuario registrado correctamente',
    usuario: usuarioSinPassword,
    accessToken
  };
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

  
  const usuarioSinPassword = { ...usuario };
  delete usuarioSinPassword.contraseña;

  return {
    message: 'Login exitoso',
    usuario: usuarioSinPassword,
    accessToken: token
  };
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

  const response = await fetch(`${ACCOUNT_SERVICE_URL}/accounts/${cuentaOrigen.id}/transactions`, {
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
  const res = await fetch(`${ACCOUNT_SERVICE_URL}/accounts/user/${userId}`);
  if (!res.ok) return null;

  const cuentas = await res.json();
  return cuentas[0]; 
}

