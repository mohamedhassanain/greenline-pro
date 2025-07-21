import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (id, email, password, full_name, company_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [adminId, 'admin@greenlinepro.com', hashedPassword, 'Admin User', 'GreenLine Pro', 'admin']);

    // Create sample suppliers
    const suppliers = [
      {
        id: uuidv4(),
        code: 'SUP-001',
        name: 'Textile Mills Inc.',
        contact: 'John Smith',
        email: 'john@textilemills.com',
        phone: '+1 (555) 123-4567',
        address: '123 Industrial Ave, Manchester, UK',
        category: 'Raw Materials',
        rating: 4.8,
        reliability: 'excellent'
      },
      {
        id: uuidv4(),
        code: 'SUP-002',
        name: 'Thread World',
        contact: 'Sarah Johnson',
        email: 'sarah@threadworld.com',
        phone: '+1 (555) 234-5678',
        address: '456 Craft Street, Birmingham, UK',
        category: 'Accessories',
        rating: 4.2,
        reliability: 'good'
      },
      {
        id: uuidv4(),
        code: 'SUP-003',
        name: 'Button Factory',
        contact: 'Mike Wilson',
        email: 'mike@buttonfactory.com',
        phone: '+1 (555) 345-6789',
        address: '789 Production Rd, Leeds, UK',
        category: 'Accessories',
        rating: 4.5,
        reliability: 'excellent'
      }
    ];

    for (const supplier of suppliers) {
      await pool.query(`
        INSERT INTO suppliers (id, supplier_code, name, contact_person, email, phone, address, category, rating, reliability)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (supplier_code) DO NOTHING
      `, [supplier.id, supplier.code, supplier.name, supplier.contact, supplier.email, supplier.phone, supplier.address, supplier.category, supplier.rating, supplier.reliability]);
    }

    // Create sample inventory items
    const inventoryItems = [
      {
        id: uuidv4(),
        code: 'INV-001',
        name: 'Cotton Fabric',
        category: 'Raw Materials',
        quantity: 500,
        unit: 'meters',
        min_stock: 100,
        unit_cost: 12.50,
        supplier_id: suppliers[0].id
      },
      {
        id: uuidv4(),
        code: 'INV-002',
        name: 'Polyester Thread',
        category: 'Accessories',
        quantity: 25,
        unit: 'rolls',
        min_stock: 50,
        unit_cost: 8.75,
        supplier_id: suppliers[1].id
      },
      {
        id: uuidv4(),
        code: 'INV-003',
        name: 'Metal Buttons',
        category: 'Accessories',
        quantity: 2000,
        unit: 'pieces',
        min_stock: 500,
        unit_cost: 0.25,
        supplier_id: suppliers[2].id
      }
    ];

    for (const item of inventoryItems) {
      await pool.query(`
        INSERT INTO inventory (id, item_code, name, category, quantity, unit, min_stock, unit_cost, supplier_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (item_code) DO NOTHING
      `, [item.id, item.code, item.name, item.category, item.quantity, item.unit, item.min_stock, item.unit_cost, item.supplier_id]);
    }

    // Create sample orders
    const orders = [
      {
        id: uuidv4(),
        number: 'ORD-001',
        client: 'Fashion Boutique Paris',
        email: 'orders@fashionboutiqueparis.com',
        product: 'Summer Collection Dresses',
        quantity: 150,
        unit_price: 45.00,
        status: 'in_progress',
        priority: 'high',
        progress: 75,
        created_by: adminId
      },
      {
        id: uuidv4(),
        number: 'ORD-002',
        client: 'Milan Style House',
        email: 'procurement@milanstyle.it',
        product: 'Winter Coats',
        quantity: 80,
        unit_price: 120.00,
        status: 'pending',
        priority: 'medium',
        progress: 25,
        created_by: adminId
      },
      {
        id: uuidv4(),
        number: 'ORD-003',
        client: 'London Fashion Co.',
        email: 'orders@londonfashion.co.uk',
        product: 'Casual Wear Set',
        quantity: 200,
        unit_price: 35.00,
        status: 'completed',
        priority: 'low',
        progress: 100,
        created_by: adminId
      }
    ];

    for (const order of orders) {
      const totalAmount = order.quantity * order.unit_price;
      await pool.query(`
        INSERT INTO orders (id, order_number, client_name, client_email, product_name, quantity, unit_price, total_amount, status, priority, progress, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (order_number) DO NOTHING
      `, [order.id, order.number, order.client, order.email, order.product, order.quantity, order.unit_price, totalAmount, order.status, order.priority, order.progress, order.created_by]);
    }

    // Create sample communications
    const communications = [
      {
        id: uuidv4(),
        conversation_id: 'conv-001',
        sender_type: 'client',
        sender_name: 'Fashion Boutique Paris',
        message: 'Hello! We need to discuss the timeline for our upcoming order.',
        is_read: false
      },
      {
        id: uuidv4(),
        conversation_id: 'conv-001',
        sender_type: 'user',
        sender_name: 'Admin User',
        message: 'Of course! I\'d be happy to help. What specific timeline are you looking for?',
        is_read: true
      },
      {
        id: uuidv4(),
        conversation_id: 'conv-002',
        sender_type: 'client',
        sender_name: 'Milan Style House',
        sender_name: 'The fabric samples look great. Proceeding with the order.',
        is_read: true
      }
    ];

    for (const comm of communications) {
      await pool.query(`
        INSERT INTO communications (id, conversation_id, sender_type, sender_name, message, is_read)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [comm.id, comm.conversation_id, comm.sender_type, comm.sender_name, comm.message, comm.is_read]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Admin login: admin@greenlinepro.com');
    console.log('🔑 Admin password: admin123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedData();