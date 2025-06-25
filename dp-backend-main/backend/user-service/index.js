import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = 3500;

app.use(cors());
app.use(express.json());

// Middleware para loguear todas las peticiones y el body recibido
app.use((req, res, next) => {
  console.log(`Request recibida: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body recibido:', req.body);
  next();
});

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`User service corriendo en puerto ${PORT}`);
});
