import express from 'express';
import accountRoutes from './routes/accountRoutes.js';

const app = express();
app.use(express.json());

app.use('/accounts', accountRoutes);

const PORT = 3600;
app.listen(PORT, () => {
  console.log(`Account service listening on port ${PORT}`);
});


