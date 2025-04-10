import express from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'clave_secreta_ultrasegura'; // idealmente usar env var
const usuarios = []; // en memoria, podés poblarlo desde el /registro si querés

const app = express();
const PORT = 3000;

app.use(express.json());

// Utilidades
const generarCVU = () => {
  return Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');
};

const generarAlias = async () => {
  try {
    const data = await fs.readFile('./palabras.txt', 'utf-8');
    const palabras = data.split('\n').map(p => p.trim()).filter(Boolean);
    if (palabras.length < 3) throw new Error('No hay suficientes palabras para generar alias');
    const alias = [];
    while (alias.length < 3) {
      const palabra = palabras[Math.floor(Math.random() * palabras.length)];
      if (!alias.includes(palabra)) alias.push(palabra);
    }
    return alias.join('.');
  } catch (err) {
    throw new Error('Error al generar alias');
  }
};

// Endpoint de registro
app.post('/registro', async (req, res) => {
  try {
    const { id, nyap, dni, email, telefono, contraseña } = req.body;

    if (!id || !nyap || !dni || !email || !telefono || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const cvu = generarCVU();
    const alias = await generarAlias();

    const usuario = {
      id,
      nyap,
      dni,
      email,
      telefono,
      cvu,
      alias
    };
    
    return res.status(200).json({
      mensaje: 'Usuario registrado OK',
      usuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  // Al final del endpoint /registro
usuarios.push({ id, nyap, dni, email, telefono, contraseña });

});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
app.post('/login', (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario inexistente' });
    }

    if (usuario.contraseña !== contraseña) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
      expiresIn: '2h'
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

