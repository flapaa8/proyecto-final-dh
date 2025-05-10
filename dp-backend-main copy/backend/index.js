import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const PORT = 3500;
const SECRET_KEY = 'secretoSuperSecreto';
const JWT_SECRET = 'clave_secreta_ultrasegura';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const rutaUsuarios = path.resolve('./usuarios.json');
let usuarios = [];

try {
  if (fsSync.existsSync(rutaUsuarios)) {
    usuarios = JSON.parse(fsSync.readFileSync(rutaUsuarios, 'utf-8'));
    console.log('Usuarios cargados desde usuarios.json');
  }
} catch (err) {
  console.error('Error leyendo usuarios.json:', err);
  usuarios = [];
}

const blacklist = [];
const cuentas = [
  {
    id: '1',
    userId: '1',
    saldo: 5000,
    cvu: '0000000000000000000001',
    alias: 'demo.alias.ejemplo',
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
    numero: '1234567898765432',
    vencimiento: '12/25',
    nombreTitular: 'Titular Ejemplo',
    codigoSeguridad: '123'
  }
];

const generarCVU = () => Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');

const generarAlias = async () => {
  try {
    const data = await fs.readFile('./palabras.txt', 'utf-8');
    const palabras = data.split('\n').map(p => p.trim()).filter(Boolean);
    if (palabras.length < 3) throw new Error('No hay suficientes palabras');
    const alias = [];
    while (alias.length < 3) {
      const palabra = palabras[Math.floor(Math.random() * palabras.length)];
      if (!alias.includes(palabra)) alias.push(palabra);
    }
    return alias.join('.');
  } catch {
    return 'alias.generico.demo';
  }
};

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token || blacklist.includes(token)) return res.status(401).json({ error: 'Acceso no autorizado' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded;
    next();
  });
};

app.get('/', (req, res) => res.status(200).send('Bienvenido al servidor'));

// Registro de usuario
app.post('/register', async (req, res) => {
  const { NyAP, dni, email, telefono, password } = req.body;
  if (!NyAP || !dni || !email || !telefono || !password) return res.status(400).json({ error: 'Faltan datos' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Email inválido' });
  if (password.length < 8) return res.status(400).json({ error: 'Contraseña muy corta' });

  const usuarioExistente = usuarios.find(u => u.dni === dni || u.email === email || u.telefono === telefono);
  if (usuarioExistente) return res.status(400).json({ error: 'Usuario ya existe' });

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const cvu = generarCVU();
  const alias = await generarAlias();

  const nuevoUsuario = { id, NyAP, dni, email, telefono, contraseña: hashedPassword };
  usuarios.push(nuevoUsuario);

  cuentas.push({ id, userId: id, saldo: 0, cvu, alias, transacciones: [] });

  try {
    await fs.writeFile(rutaUsuarios, JSON.stringify(usuarios));
    return res.status(201).json({ mensaje: 'Usuario registrado', cvu, alias });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo guardar el usuario' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });

  const passwordValido = await bcrypt.compare(password, usuario.contraseña);
  if (!passwordValido) return res.status(400).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ mensaje: 'Login exitoso', token });
});




app.get('/perfil', verificarToken, (req, res) => res.json({ mensaje: 'Perfil de usuario', user: req.user }));

app.get('/accounts/:id', verificarToken, (req, res) => {
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
  res.json({ saldo: cuenta.saldo, cvu: cuenta.cvu, alias: cuenta.alias });
});

app.get('/accounts/:id/transactions', verificarToken, (req, res) => {
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
  res.json({ transacciones: cuenta.transacciones.slice(-5) });
});

app.get('/accounts/:id/activity', verificarToken, (req, res) => {
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
  res.json([...cuenta.transacciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
});

app.get('/accounts/:id/activity/:transactionId', verificarToken, (req, res) => {
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
  const transaccion = cuenta.transacciones.find(t => t.id === req.params.transactionId);
  if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
  res.json(transaccion);
});

app.get('/accounts/:id/transferences', verificarToken, (req, res) => {
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(403).json({ error: 'Permisos insuficientes' });

  const destinatarios = cuenta.transacciones.filter(t => t.tipo === 'transferencia' && t.destino).map(t => t.destino).slice(-5).reverse();
  res.json({ destinatarios });
});

app.post('/accounts/:id/transferences', verificarToken, (req, res) => {
  const { monto, destino, descripcion } = req.body;
  const cuentaOrigen = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuentaOrigen) return res.status(403).json({ error: 'Permisos insuficientes' });
  if (!monto || !destino || isNaN(monto) || monto <= 0) return res.status(400).json({ error: 'Monto o destino inválido' });

  const usuarioDestino = usuarios.find(u => u.cvu === destino || u.alias === destino);
  if (!usuarioDestino) return res.status(400).json({ error: 'Destino no encontrado' });
  const cuentaDestino = cuentas.find(c => c.userId === usuarioDestino.id);
  if (!cuentaDestino) return res.status(400).json({ error: 'Cuenta destino no encontrada' });
  if (cuentaOrigen.saldo < monto) return res.status(410).json({ error: 'Fondos insuficientes' });

  const transSalida = { id: (cuentaOrigen.transacciones.length + 1).toString(), tipo: 'transferencia', monto: -monto, fecha: new Date().toISOString(), detalle: descripcion || 'Transferencia', destino, estado: 'Completado' };
  const transEntrada = { id: (cuentaDestino.transacciones.length + 1).toString(), tipo: 'transferencia', monto, fecha: new Date().toISOString(), detalle: `Desde cuenta ${req.params.id}`, origen: `Cuenta ${req.params.id}`, estado: 'Completado' };

  cuentaOrigen.saldo -= monto;
  cuentaDestino.saldo += monto;
  cuentaOrigen.transacciones.push(transSalida);
  cuentaDestino.transacciones.push(transEntrada);

  res.json({ mensaje: 'Transferencia exitosa', transaccion: transSalida, saldoActual: cuentaOrigen.saldo });
});

app.get('/cards', verificarToken, (req, res) => {
  const tarjetasUsuario = tarjetas.filter(t => cuentas.find(c => c.id === t.cuentaId && c.userId === req.user.id));
  res.json(tarjetasUsuario.map(t => ({ ...t, numero: `•••• •••• •••• ${t.numero.slice(-4)}`, codigoSeguridad: '•••' })));
});

app.post('/accounts/:id/topup', verificarToken, (req, res) => {
  const { monto, tarjetaId, descripcion } = req.body;
  const cuenta = cuentas.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });

  const tarjeta = tarjetas.find(t => t.id === tarjetaId && t.cuentaId === req.params.id);
  if (!tarjeta || !monto || isNaN(monto) || monto <= 0) return res.status(400).json({ error: 'Datos inválidos' });

  const trans = { id: (cuenta.transacciones.length + 1).toString(), tipo: 'depósito', monto: parseFloat(monto), fecha: new Date().toISOString(), detalle: descripcion || `Ingreso desde tarjeta`, origen: `Tarjeta ${tarjeta.tipo} (••••${tarjeta.numero.slice(-4)})`, estado: 'Completado' };
  cuenta.saldo += trans.monto;
  cuenta.transacciones.push(trans);

  res.status(201).json({ mensaje: 'Ingreso registrado', transaccion: trans, saldoActual: cuenta.saldo });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
