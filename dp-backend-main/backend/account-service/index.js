import express from 'express';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes.js';

const app = express();
const PORT = 3600;

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

app.use('/accounts', accountRoutes);

app.listen(PORT, () => {
  console.log(`Account service listening on port ${PORT}`);
});


