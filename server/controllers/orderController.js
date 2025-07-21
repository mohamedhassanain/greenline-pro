import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getOrders = async (req, res) => {
  const { status, priority, page = 1, limit = 10, search } = req.query;

  try {
    let query = `
      SELECT o.*, u.full_name as created_by_name
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND o.priority = $${paramCount}`;
      params.push(priority);
    }

    if (search) {
      paramCount++;
      query += ` AND (o.client_name ILIKE $${paramCount} OR o.product_name ILIKE $${paramCount} OR o.order_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND o.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (priority) {
      countParamCount++;
      countQuery += ` AND o.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (o.client_name ILIKE $${countParamCount} OR o.product_name ILIKE $${countParamCount} OR o.order_number ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name as created_by_name
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrder = async (req, res) => {
  const {
    client_name,
    client_email,
    client_phone,
    client_address,
    product_name,
    quantity,
    unit_price,
    priority = 'medium',
    deadline,
    notes
  } = req.body;

  try {
    const orderId = uuidv4();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const totalAmount = quantity * unit_price;

    const result = await pool.query(
      `INSERT INTO orders (
        id, order_number, client_name, client_email, client_phone, client_address,
        product_name, quantity, unit_price, total_amount, priority, deadline, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        orderId, orderNumber, client_name, client_email, client_phone, client_address,
        product_name, quantity, unit_price, totalAmount, priority, deadline, notes, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if order exists
    const existingOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingOrder.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
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

    // Recalculate total if quantity or unit_price changed
    if (updates.quantity || updates.unit_price) {
      const currentOrder = existingOrder.rows[0];
      const newQuantity = updates.quantity || currentOrder.quantity;
      const newUnitPrice = updates.unit_price || currentOrder.unit_price;
      const newTotal = newQuantity * newUnitPrice;
      
      paramCount++;
      updateFields.push(`total_amount = $${paramCount}`);
      values.push(newTotal);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);

    res.json({
      message: 'Order updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_orders,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days,
        COALESCE(SUM(total_amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_last_30_days
      FROM orders
    `);

    const monthlyStats = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      stats: stats.rows[0],
      monthly_stats: monthlyStats.rows
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};