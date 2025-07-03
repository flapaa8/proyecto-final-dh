import express from 'express';
import cors from 'cors';
import cardsRoutes from './cards.routes.js'; // asegúrate de que este path sea correcto

const app = express();
const PORT = 3602;

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

app.use('/cards', cardsRoutes);

app.listen(PORT, () => {
  console.log(`Cards service escuchando en http://localhost:${PORT}`);
});



