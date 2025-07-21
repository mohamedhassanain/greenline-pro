import express from 'express';
import { 
  getAvailableRoles,
  sendMessage
} from '../controllers/legalChatbotController.js';

const router = express.Router();

// Obtenir les rôles disponibles
router.get('/roles', getAvailableRoles);

// Envoyer un message
router.post('/message', sendMessage);

export default router;
