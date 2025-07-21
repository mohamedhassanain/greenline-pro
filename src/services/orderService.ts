import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export const orderService = {
  // Get all orders
  async getOrders() {
    console.log('🔍 Fetching orders from Supabase...');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    console.log('✅ Orders fetched successfully:', data?.length || 0, 'orders');
    return data;
  },

  // Get order by ID
  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new order
  async createOrder(order: OrderInsert) {
    console.log('🔄 Creating order in Supabase...');
    
    // Generate order number
    const orderNumber = `ORD-${String(Date.now()).slice(-6)}`;
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        order_number: orderNumber,
        status: order.status || 'En attente',
        progress: 0,
        total_amount: (order.quantity || 1) * (order.unit_price || 0),
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating order:', error);
      throw new Error(`Erreur création: ${error.message}`);
    }
    
    console.log('✅ Order created successfully in database:', data);
    return data;
  },

  // Update order
  async updateOrder(id: string, updates: OrderUpdate) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        total_amount: updates.quantity && updates.unit_price 
          ? updates.quantity * updates.unit_price 
          : undefined,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete order
  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get orders by status
  async getOrdersByStatus(status: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get orders statistics
  async getOrdersStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at');
    
    if (error) throw error;

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      in_progress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      total_value: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      monthly_revenue: orders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          const currentMonth = new Date();
          return orderDate.getMonth() === currentMonth.getMonth() &&
                 orderDate.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
    };

    return stats;
  },
};