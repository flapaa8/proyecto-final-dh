import * as userService from '../services/userService.js';
import fs from 'fs/promises';
import path from 'path';

const usuariosPath = path.resolve('./data/usuarios.json');

export async function registerUser(req, res) {
  console.log('BODY RECIBIDO EN REGISTER:', req.body); 
  try {
    console.log('HEADERS:', req.headers);
    console.log('BODY RECIBIDO EN REGISTER:', req.body);
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('ERROR EN REGISTER:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function loginUser(req, res) {
  try {
    const result = await userService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    console.log('Buscando usuario con ID:', req.params.id);

    const data = await fs.readFile(usuariosPath, 'utf-8');
    const usuarios = JSON.parse(data);

    console.log('Usuarios cargados:', usuarios.map(u => u.id));

    const usuario = usuarios.find(u => String(u.id) === String(req.params.id));

    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', usuario);
    res.json(usuario);
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
export async function realizarTransferencia(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const result = await userService.transferencia(id, body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
