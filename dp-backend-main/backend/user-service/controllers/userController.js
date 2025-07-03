import * as userService from '../services/userService.js';
import fs from 'fs/promises';
import path from 'path';

const usuariosPath = path.resolve('./data/usuarios.json');

export async function registerUser(req, res) {
  console.log('BODY RECIBIDO EN REGISTER:', req.body);
  console.log('HEADERS:', req.headers);

  try {
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
    console.error('ERROR EN LOGIN:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    console.log('Buscando usuario con ID:', userId);

    const data = await fs.readFile(usuariosPath, 'utf-8');
    const usuarios = JSON.parse(data);

    console.log('Usuarios cargados:', usuarios.map(u => u.id));

    const usuario = usuarios.find(u => String(u.id) === String(userId));

    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', usuario);
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function realizarTransferencia(req, res) {
  try {
    const userId = req.params.id;
    const body = req.body;

    const result = await userService.transferencia(userId, body);
    res.status(200).json(result);
  } catch (err) {
    console.error('ERROR EN TRANSFERENCIA:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
}

