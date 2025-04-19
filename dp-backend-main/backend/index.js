import express from 'express';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';

// Configuración inicial
const JWT_SECRET = 'clave_secreta_ultrasegura';
const usuarios = [];
const blacklist = [];
const cuentas = [
  {
    id: '1',
    userId: '1', // Nuevo campo para asociar cuenta a usuario
    saldo: 5000,
    transacciones: [
      { id: '1', tipo: 'depósito', monto: 1000, fecha: '2025-04-01', detalle: 'Depósito inicial', origen: 'Efectivo' },
      { id: '2', tipo: 'retiro', monto: 500, fecha: '2025-04-02', detalle: 'Retiro cajero', origen: 'ATM' }
    ]
  }
];
const tarjetas = [
  { 
    id: '1', 
    cuentaId: '1', 
    tipo: 'Débito', 
    numero: '1234567898765432', // Sin guiones para mejor manejo
    vencimiento: '12/25',
    nombreTitular: 'Titular Ejemplo',
    codigoSeguridad: '123'
  }
];

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

// Middleware de autenticación
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  if (blacklist.includes(token)) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
};

// Endpoints de autenticación (se mantienen igual)
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
      contraseña
    };

    usuarios.push(usuario);
    return res.status(200).json({
      mensaje: 'Usuario registrado OK',
      usuario: { id, nyap, dni, email, telefono, cvu, alias }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
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

app.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'No se proporcionó un token' });
  }

  blacklist.push(token);
  return res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
});

// Endpoints de perfil
app.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ mensaje: 'Perfil de usuario', user: req.user });
});

// Endpoints de cuentas
app.get('/accounts/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  res.status(200).json({
    saldo: cuenta.saldo,
    cvu: cuenta.cvu,
    alias: cuenta.alias
  });
});

// Endpoints de transacciones
app.get('/accounts/:id/transactions', verificarToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  res.status(200).json({
    transacciones: cuenta.transacciones.slice(-5)
  });
});

// Endpoint para toda la actividad
app.get('/accounts/:id/activity', verificarToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  const actividadOrdenada = [...cuenta.transacciones].sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  );

  res.status(200).json(actividadOrdenada);
});

// Endpoint para detalle de transacción
app.get('/accounts/:id/activity/:transactionId', verificarToken, (req, res) => {
  const { id, transactionId } = req.params;
  const userId = req.user.id;

  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  const transaccion = cuenta.transacciones.find(t => t.id === transactionId);
  if (!transaccion) {
    return res.status(404).json({ error: 'Transacción no encontrada' });
  }

  res.status(200).json(transaccion);
});

// CRUD de Tarjetas (Nuevo)
app.get('/cards', verificarToken, (req, res) => {
  const userId = req.user.id;
  
  const tarjetasUsuario = tarjetas.filter(t => {
    const cuenta = cuentas.find(c => c.id === t.cuentaId);
    return cuenta && cuenta.userId === userId;
  });

  // Ocultar datos sensibles
  const tarjetasSeguras = tarjetasUsuario.map(t => ({
    ...t,
    numero: `•••• •••• •••• ${t.numero.slice(-4)}`,
    codigoSeguridad: '•••'
  }));

  res.status(200).json(tarjetasSeguras);
});

app.post('/accounts/:id/cards', verificarToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { tipo, numero, vencimiento, nombreTitular, codigoSeguridad } = req.body;

  // Validaciones
  if (!tipo || !numero || !vencimiento || !nombreTitular || !codigoSeguridad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!['Débito', 'Crédito'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de tarjeta inválido' });
  }

  // Verificar cuenta
  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  // Crear tarjeta
  const nuevaTarjeta = {
    id: (tarjetas.length + 1).toString(),
    cuentaId: id,
    tipo,
    numero: numero.replace(/\s+/g, ''), // Eliminar espacios
    vencimiento,
    nombreTitular,
    codigoSeguridad,
    fechaCreacion: new Date().toISOString()
  };

  tarjetas.push(nuevaTarjeta);
  res.status(201).json({
    mensaje: 'Tarjeta agregada correctamente',
    tarjeta: {
      ...nuevaTarjeta,
      numero: `•••• •••• •••• ${nuevaTarjeta.numero.slice(-4)}`,
      codigoSeguridad: '•••'
    }
  });
});

// Endpoint para ingresos desde tarjeta (Nuevo)
app.post('/accounts/:id/transferences', verificarToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { monto, tarjetaId, descripcion } = req.body;

  // Validaciones
  if (!monto || !tarjetaId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (isNaN(monto) || monto <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  // Verificar cuenta y permisos
  const cuenta = cuentas.find(c => c.id === id && c.userId === userId);
  if (!cuenta) {
    return res.status(404).json({ error: 'Cuenta no encontrada' });
  }

  // Verificar tarjeta
  const tarjeta = tarjetas.find(t => t.id === tarjetaId && t.cuentaId === id);
  if (!tarjeta) {
    return res.status(404).json({ error: 'Tarjeta no encontrada' });
  }

  // Crear transacción
  const nuevaTransaccion = {
    id: (cuenta.transacciones.length + 1).toString(),
    tipo: 'depósito',
    monto: parseFloat(monto),
    fecha: new Date().toISOString(),
    detalle: descripcion || `Ingreso desde tarjeta ${tarjeta.tipo}`,
    origen: `Tarjeta ${tarjeta.tipo} (••••${tarjeta.numero.slice(-4)})`,
    estado: 'Completado'
  };

  // Actualizar saldo
  cuenta.saldo += nuevaTransaccion.monto;
  cuenta.transacciones.push(nuevaTransaccion);

  res.status(201).json({
    mensaje: 'Ingreso registrado correctamente',
    transaccion: nuevaTransaccion,
    saldoActual: cuenta.saldo
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Datos iniciales:`);
  console.log(`- Usuario demo: ID 1`);
  console.log(`- Cuenta demo: ID 1 con saldo $${cuentas[0].saldo}`);
  console.log(`- Tarjeta demo: ID 1 terminada en ${tarjetas[0].numero.slice(-4)}`);
});
