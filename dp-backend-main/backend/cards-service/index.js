import express from 'express';
import cors from 'cors';
import cardsRoutes from './cards.routes.js'; // <-- acá va el path correcto

const app = express();

app.use(cors());
app.use(express.json());

app.use('/cards', cardsRoutes);

const PORT = 3602;
app.listen(PORT, () => {
  console.log(`Cards service escuchando en http://localhost:${PORT}`);
});



