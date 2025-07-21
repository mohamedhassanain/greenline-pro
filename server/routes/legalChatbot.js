import express from 'express';
import { 
  getAvailableRoles,
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation
} from '../controllers/legalChatbotController.js';

const router = express.Router();

// Obtenir les rôles disponibles
router.get('/roles', getAvailableRoles);

// Envoyer un message
router.post('/message', sendMessage);

// Gérer les conversations
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.delete('/conversations/:id', deleteConversation);

// Route pour la compatibilité avec l'ancien endpoint
router.post('/', sendMessage);

export default router;
