import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = 3500;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
