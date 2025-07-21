import express from 'express';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getInventoryStats
} from '../controllers/inventoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest, inventorySchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all inventory items
router.get('/', getInventory);

// Get inventory statistics
router.get('/stats', getInventoryStats);

// Get specific inventory item
router.get('/:id', getInventoryItem);

// Create new inventory item
router.post('/', validateRequest(inventorySchemas.create), createInventoryItem);

// Update inventory item
router.put('/:id', validateRequest(inventorySchemas.update), updateInventoryItem);

// Update stock quantity
router.put('/:id/stock', updateStock);

// Delete inventory item (admin/manager only)
router.delete('/:id', authenticateToken, deleteInventoryItem);

export default router;