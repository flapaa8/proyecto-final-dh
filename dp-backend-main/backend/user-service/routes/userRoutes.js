import express from 'express';
import { registerUser, loginUser, getUserById, realizarTransferencia } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.post('/:id/transferences', realizarTransferencia); 

export default router;


