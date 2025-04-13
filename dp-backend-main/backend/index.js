import express from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
//sprint 1
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
      alias,
      contraseña // Guardamos la contraseña aquí
    };

    // Guardar el usuario en memoria antes de devolver la respuesta
    usuarios.push(usuario);

    return res.status(200).json({
      mensaje: 'Usuario registrado OK',
      usuario: { id, nyap, dni, email, telefono, cvu, alias } // No devolver contraseña
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
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

const blacklist = [];
app.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener token del header

  if (!token) {
    return res.status(400).json({ error: 'No se proporcionó un token' });
  }

  // Agregar el token a la lista negra
  blacklist.push(token);

  return res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
});
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener token del header

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  // Verificar si el token está en la lista negra
  if (blacklist.includes(token)) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded; // Guardar los datos del usuario en la solicitud
    next();
  });
};
app.get('/perfil', verificarToken, (req, res) => {
  // Si el token es válido y no está en la lista negra
  res.status(200).json({ mensaje: 'Perfil de usuario', user: req.user });
});

// sprint 2
// Datos de ejemplo para el resumen de cuenta y transacciones
const cuentas = [
  {
    id: '1',
    saldo: 5000,
    transacciones: [
      { id: '1', tipo: 'depósito', monto: 1000, fecha: '2025-04-01' },
      { id: '2', tipo: 'retiro', monto: 500, fecha: '2025-04-02' },
      { id: '3', tipo: 'depósito', monto: 1500, fecha: '2025-04-03' },
      { id: '4', tipo: 'retiro', monto: 200, fecha: '2025-04-04' },
      { id: '5', tipo: 'depósito', monto: 800, fecha: '2025-04-05' }
    ]
  }
];

// Endpoint para obtener el saldo disponible
app.get('/accounts/:id', (req, res) => {
  const { id } = req.params;
  const cuenta = cuentas.find(c => c.id === id);

  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  res.status(200).json({
    saldo: cuenta.saldo
  });
});

// Endpoint para obtener los últimos 5 movimientos
app.get('/accounts/:id/transactions', (req, res) => {
  const { id } = req.params;
  const cuenta = cuentas.find(c => c.id === id);

  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  const ultimosMovimientos = cuenta.transacciones.slice(-5); // Últimos 5 movimientos
  res.status(200).json({
    transacciones: ultimosMovimientos
  });
});
// Endpoint para obtener los datos de un usuario
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.status(200).json({
    id: usuario.id,
    nyap: usuario.nyap,
    dni: usuario.dni,
    email: usuario.email,
    telefono: usuario.telefono,
    cvu: usuario.cvu,
    alias: usuario.alias
  });
});

// Endpoint para actualizar los datos del usuario
app.patch('/users/:id', (req, res) => {
  const { id } = req.params;
  const { nyap, dni, email, telefono } = req.body;
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Actualizar solo los campos que fueron proporcionados
  if (nyap) usuario.nyap = nyap;
  if (dni) usuario.dni = dni;
  if (email) usuario.email = email;
  if (telefono) usuario.telefono = telefono;

  res.status(200).json({
    mensaje: 'Datos de usuario actualizados',
    usuario
  });
});

// Endpoint para obtener la información de la cuenta
app.get('/accounts/:id', (req, res) => {
  const { id } = req.params;
  const cuenta = cuentas.find(c => c.id === id);

  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  res.status(200).json({
    saldo: cuenta.saldo,
    cvu: cuenta.cvu,
    alias: cuenta.alias
  });
});

// Endpoint para actualizar la información de la cuenta
app.patch('/accounts/:id', (req, res) => {
  const { id } = req.params;
  const { saldo, cvu, alias } = req.body;
  const cuenta = cuentas.find(c => c.id === id);

  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  // Actualizar solo los campos que fueron proporcionados
  if (saldo) cuenta.saldo = saldo;
  if (cvu) cuenta.cvu = cvu;
  if (alias) cuenta.alias = alias;

  res.status(200).json({
    mensaje: 'Datos de la cuenta actualizados',
    cuenta
  });
});
// Datos de ejemplo de tarjetas
const tarjetas = [
  { id: '1', cuentaId: '1', tipo: 'Débito', numero: '1234-5678-9876-5432', vencimiento: '12/25' },
  { id: '2', cuentaId: '1', tipo: 'Crédito', numero: '2345-6789-8765-4321', vencimiento: '11/24' }
];

// Obtener todas las tarjetas asociadas a una cuenta
app.get('/accounts/:id/cards', (req, res) => {
  const { id } = req.params;
  const tarjetasUsuario = tarjetas.filter(t => t.cuentaId === id);

  if (tarjetasUsuario.length === 0) {
    return res.status(200).json([]); // No tiene tarjetas
  }

  res.status(200).json(tarjetasUsuario); // Devuelve la lista de tarjetas
});

// Obtener los datos de una tarjeta específica
app.get('/accounts/:accountId/cards/:cardId', (req, res) => {
  const { accountId, cardId } = req.params;
  const tarjeta = tarjetas.find(t => t.cuentaId === accountId && t.id === cardId);

  if (!tarjeta) {
    return res.status(500).json({ error: 'Tarjeta no encontrada' });
  }

  res.status(200).json(tarjeta); // Devuelve los datos de la tarjeta
});
// Endpoint para agregar una tarjeta a una cuenta
app.post('/accounts/:id/cards', (req, res) => {
  const { id } = req.params;
  const { tipo, numero, vencimiento } = req.body;

  if (!tipo || !numero || !vencimiento) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Verificar si la tarjeta ya está asociada a otra cuenta
  const tarjetaExistente = tarjetas.find(t => t.numero === numero);

  if (tarjetaExistente) {
    return res.status(409).json({ error: 'La tarjeta ya está asociada a otra cuenta' });
  }

  // Crear la nueva tarjeta
  const nuevaTarjeta = {
    id: (tarjetas.length + 1).toString(),
    cuentaId: id,
    tipo,
    numero,
    vencimiento
  };

  tarjetas.push(nuevaTarjeta);

  res.status(201).json({
    mensaje: 'Tarjeta agregada correctamente',
    tarjeta: nuevaTarjeta
  });
});
// Endpoint para eliminar una tarjeta de una cuenta
app.delete('/accounts/:accountId/cards/:cardId', (req, res) => {
  const { accountId, cardId } = req.params;

  // Buscar la tarjeta a eliminar
  const tarjetaIndex = tarjetas.findIndex(t => t.cuentaId === accountId && t.id === cardId);

  if (tarjetaIndex === -1) {
    return res.status(404).json({ error: 'Tarjeta no encontrada' });
  }

  // Eliminar la tarjeta
  tarjetas.splice(tarjetaIndex, 1);

  res.status(200).json({ mensaje: 'Tarjeta eliminada correctamente' });
});

