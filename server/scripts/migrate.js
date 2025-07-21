import pool from '../config/database.js';

const migrations = [
  // Users table
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    avatar_url TEXT,
    phone VARCHAR(50),
    address TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Orders table
  `CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Suppliers table
  `CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reliability VARCHAR(50) DEFAULT 'good' CHECK (reliability IN ('poor', 'fair', 'good', 'excellent')),
    payment_terms TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Inventory table
  `CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
    min_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id),
    location VARCHAR(255),
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Inventory transactions table
  `CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity_change INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Communications table
  `CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id VARCHAR(100) NOT NULL,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('user', 'client')),
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Export orders table
  `CREATE TABLE IF NOT EXISTS export_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    client_name VARCHAR(255) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    destination_address TEXT NOT NULL,
    product_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    weight DECIMAL(10,2),
    value DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'EUR',
    carrier VARCHAR(255),
    tracking_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'in_transit', 'customs_clearance', 'delivered', 'cancelled')),
    estimated_delivery DATE,
    actual_delivery DATE,
    documents JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create indexes for better performance
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);`,
  `CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(quantity, min_stock);`,
  `CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);`,
  `CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_communications_conversation ON communications(conversation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_export_orders_status ON export_orders(status);`,

  // Create triggers for updated_at timestamps
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = CURRENT_TIMESTAMP;
     RETURN NEW;
   END;
   $$ language 'plpgsql';`,

  `DROP TRIGGER IF EXISTS update_users_updated_at ON users;
   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
   CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
   CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
   CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_export_orders_updated_at ON export_orders;
   CREATE TRIGGER update_export_orders_updated_at BEFORE UPDATE ON export_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      await pool.query(migrations[i]);
    }
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();