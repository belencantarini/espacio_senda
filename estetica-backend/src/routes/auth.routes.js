import express from 'express';
import { 
  register, 
  login, 
  perfil, 
  forgotPassword, 
  resetPassword   
} from '../controllers/auth.controller.js';
import verificarToken from '../middleware/verificarToken.js'; 

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// ¡Ruta reactivada!
router.get('/me', verificarToken, perfil);

// --- RUTAS DE RECUPERACIÓN DE CONTRASEÑA ---
router.post('/forgot-password', forgotPassword); // Recibe el email y manda el link
router.post('/reset-password', resetPassword);   // Recibe el token y la nueva clave

export default router;