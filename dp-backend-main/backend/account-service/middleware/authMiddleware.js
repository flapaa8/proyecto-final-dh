import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_ultrasegura';

export function validarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); 
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error validando token:', err);  
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.log('Token decodificado:', decoded);  
    req.userId = decoded.id;
    next();
  });
}
