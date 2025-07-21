import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, userSchemas } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(userSchemas.register), register);
router.post('/login', validateRequest(userSchemas.login), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;