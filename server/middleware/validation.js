import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().required(),
    company_name: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Order validation schemas
export const orderSchemas = {
  create: Joi.object({
    client_name: Joi.string().required(),
    client_email: Joi.string().email().optional(),
    client_phone: Joi.string().optional(),
    client_address: Joi.string().optional(),
    product_name: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    unit_price: Joi.number().min(0).required(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    deadline: Joi.date().optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    client_name: Joi.string().optional(),
    client_email: Joi.string().email().optional(),
    client_phone: Joi.string().optional(),
    client_address: Joi.string().optional(),
    product_name: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    unit_price: Joi.number().min(0).optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    progress: Joi.number().min(0).max(100).optional(),
    deadline: Joi.date().optional(),
    notes: Joi.string().optional()
  })
};

// Inventory validation schemas
export const inventorySchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
    unit: Joi.string().required(),
    min_stock: Joi.number().integer().min(0).required(),
    max_stock: Joi.number().integer().min(0).optional(),
    unit_cost: Joi.number().min(0).required(),
    supplier_id: Joi.string().uuid().optional(),
    location: Joi.string().optional()
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    quantity: Joi.number().integer().min(0).optional(),
    unit: Joi.string().optional(),
    min_stock: Joi.number().integer().min(0).optional(),
    max_stock: Joi.number().integer().min(0).optional(),
    unit_cost: Joi.number().min(0).optional(),
    supplier_id: Joi.string().uuid().optional(),
    location: Joi.string().optional()
  })
};

// Supplier validation schemas
export const supplierSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    contact_person: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    category: Joi.string().required(),
    payment_terms: Joi.string().optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    contact_person: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    category: Joi.string().optional(),
    rating: Joi.number().min(1).max(5).optional(),
    reliability: Joi.string().valid('poor', 'fair', 'good', 'excellent').optional(),
    payment_terms: Joi.string().optional(),
    notes: Joi.string().optional(),
    is_active: Joi.boolean().optional()
  })
};