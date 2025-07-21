import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getInventory = async (req, res) => {
  const { category, low_stock, page = 1, limit = 10, search } = req.query;

  try {
    let query = `
      SELECT i.*, s.name as supplier_name, s.contact_person
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND i.category = $${paramCount}`;
      params.push(category);
    }

    if (low_stock === 'true') {
      query += ` AND i.quantity <= i.min_stock`;
    }

    if (search) {
      paramCount++;
      query += ` AND (i.name ILIKE $${paramCount} OR i.item_code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY i.name`;

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
    let countQuery = `SELECT COUNT(*) as total FROM inventory i WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;

    if (category) {
      countParamCount++;
      countQuery += ` AND i.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (low_stock === 'true') {
      countQuery += ` AND i.quantity <= i.min_stock`;
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (i.name ILIKE $${countParamCount} OR i.item_code ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      inventory: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT i.*, s.name as supplier_name, s.contact_person, s.email as supplier_email, s.phone as supplier_phone
       FROM inventory i
       LEFT JOIN suppliers s ON i.supplier_id = s.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInventoryItem = async (req, res) => {
  const {
    name,
    category,
    quantity,
    unit,
    min_stock,
    max_stock,
    unit_cost,
    supplier_id,
    location
  } = req.body;

  try {
    const itemId = uuidv4();
    const itemCode = `INV-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO inventory (
        id, item_code, name, category, quantity, unit, min_stock, max_stock, 
        unit_cost, supplier_id, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [itemId, itemCode, name, category, quantity, unit, min_stock, max_stock, unit_cost, supplier_id, location]
    );

    res.status(201).json({
      message: 'Inventory item created successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if item exists
    const existingItem = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (existingItem.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
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
      UPDATE inventory 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);

    res.json({
      message: 'Inventory item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity, transaction_type, notes } = req.body;

  try {
    // Get current item
    const itemResult = await pool.query('SELECT quantity FROM inventory WHERE id = $1', [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const currentQuantity = itemResult.rows[0].quantity;
    let newQuantity = currentQuantity;

    switch (transaction_type) {
      case 'in':
        newQuantity += quantity;
        break;
      case 'out':
        newQuantity -= quantity;
        if (newQuantity < 0) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        break;
      case 'adjustment':
        newQuantity = quantity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid transaction type' });
    }

    // Update inventory
    const updateResult = await pool.query(
      `UPDATE inventory 
       SET quantity = $1, last_restocked = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [newQuantity, id]
    );

    // Record transaction
    await pool.query(
      `INSERT INTO inventory_transactions (id, inventory_id, transaction_type, quantity_change, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), id, transaction_type, quantity - currentQuantity, notes]
    );

    res.json({
      message: 'Stock updated successfully',
      item: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE quantity <= min_stock) as low_stock_items,
        COUNT(*) FILTER (WHERE quantity = 0) as out_of_stock_items,
        COALESCE(SUM(quantity * unit_cost), 0) as total_value,
        COUNT(DISTINCT category) as total_categories
      FROM inventory
    `);

    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as item_count,
        COALESCE(SUM(quantity * unit_cost), 0) as category_value
      FROM inventory
      GROUP BY category
      ORDER BY category_value DESC
    `);

    const lowStockItems = await pool.query(`
      SELECT id, item_code, name, quantity, min_stock, unit
      FROM inventory
      WHERE quantity <= min_stock
      ORDER BY (quantity::float / min_stock::float) ASC
      LIMIT 10
    `);

    res.json({
      stats: stats.rows[0],
      category_stats: categoryStats.rows,
      low_stock_items: lowStockItems.rows
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};