import express from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
} from '../controllers/supplierController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateRequest, supplierSchemas } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all suppliers
router.get('/', getSuppliers);

// Get supplier statistics
router.get('/stats', getSupplierStats);

// Get specific supplier
router.get('/:id', getSupplier);

// Create new supplier
router.post('/', validateRequest(supplierSchemas.create), createSupplier);

// Update supplier
router.put('/:id', validateRequest(supplierSchemas.update), updateSupplier);

// Delete supplier (admin/manager only)
router.delete('/:id', authenticateToken, deleteSupplier);

export default router;