import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest, orderSchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all orders
router.get('/', getOrders);

// Get order statistics
router.get('/stats', getOrderStats);

// Get specific order
router.get('/:id', getOrder);

// Create new order
router.post('/', validateRequest(orderSchemas.create), createOrder);

// Update order
router.put('/:id', validateRequest(orderSchemas.update), updateOrder);

// Delete order (admin/manager only)
router.delete('/:id', authenticateToken, deleteOrder);

export default router;