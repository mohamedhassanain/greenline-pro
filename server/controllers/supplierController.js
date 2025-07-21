import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getSuppliers = async (req, res) => {
  const { category, active_only = 'true', page = 1, limit = 10, search } = req.query;

  try {
    let query = `
      SELECT s.*, 
        COUNT(i.id) as inventory_items_count,
        COALESCE(AVG(i.unit_cost), 0) as avg_unit_cost
      FROM suppliers s
      LEFT JOIN inventory i ON s.id = i.supplier_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (active_only === 'true') {
      query += ` AND s.is_active = true`;
    }

    if (category) {
      paramCount++;
      query += ` AND s.category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (s.name ILIKE $${paramCount} OR s.contact_person ILIKE $${paramCount} OR s.supplier_code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.name`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM suppliers s WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;

    if (active_only === 'true') {
      countQuery += ` AND s.is_active = true`;
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND s.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (s.name ILIKE $${countParamCount} OR s.contact_person ILIKE $${countParamCount} OR s.supplier_code ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      suppliers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.*, 
        COUNT(i.id) as inventory_items_count,
        COALESCE(SUM(i.quantity * i.unit_cost), 0) as total_inventory_value
       FROM suppliers s
       LEFT JOIN inventory i ON s.id = i.supplier_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Get supplier's inventory items
    const inventoryResult = await pool.query(
      'SELECT id, item_code, name, quantity, unit, unit_cost FROM inventory WHERE supplier_id = $1',
      [id]
    );

    res.json({ 
      supplier: result.rows[0],
      inventory_items: inventoryResult.rows
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSupplier = async (req, res) => {
  const {
    name,
    contact_person,
    email,
    phone,
    address,
    category,
    payment_terms,
    notes
  } = req.body;

  try {
    const supplierId = uuidv4();
    const supplierCode = `SUP-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO suppliers (
        id, supplier_code, name, contact_person, email, phone, address, 
        category, payment_terms, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [supplierId, supplierCode, name, contact_person, email, phone, address, category, payment_terms, notes]
    );

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier: result.rows[0]
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if supplier exists
    const existingSupplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE suppliers 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);

    res.json({
      message: 'Supplier updated successfully',
      supplier: result.rows[0]
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    // Soft delete - set is_active to false
    const result = await pool.query(
      'UPDATE suppliers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deactivated successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSupplierStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_suppliers,
        COUNT(*) FILTER (WHERE is_active = true) as active_suppliers,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_suppliers,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(DISTINCT category) as total_categories
      FROM suppliers
    `);

    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as supplier_count,
        COALESCE(AVG(rating), 0) as avg_rating
      FROM suppliers
      WHERE is_active = true
      GROUP BY category
      ORDER BY supplier_count DESC
    `);

    const reliabilityStats = await pool.query(`
      SELECT 
        reliability,
        COUNT(*) as count
      FROM suppliers
      WHERE is_active = true
      GROUP BY reliability
      ORDER BY 
        CASE reliability
          WHEN 'excellent' THEN 1
          WHEN 'good' THEN 2
          WHEN 'fair' THEN 3
          WHEN 'poor' THEN 4
        END
    `);

    const topSuppliers = await pool.query(`
      SELECT 
        s.id, s.name, s.rating, s.reliability,
        COUNT(i.id) as inventory_items,
        COALESCE(SUM(i.quantity * i.unit_cost), 0) as total_value
      FROM suppliers s
      LEFT JOIN inventory i ON s.id = i.supplier_id
      WHERE s.is_active = true
      GROUP BY s.id, s.name, s.rating, s.reliability
      ORDER BY s.rating DESC, total_value DESC
      LIMIT 10
    `);

    res.json({
      stats: stats.rows[0],
      category_stats: categoryStats.rows,
      reliability_stats: reliabilityStats.rows,
      top_suppliers: topSuppliers.rows
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};