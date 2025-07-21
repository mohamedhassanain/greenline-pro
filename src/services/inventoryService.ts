import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Inventory = Database['public']['Tables']['inventory']['Row'];
type InventoryInsert = Database['public']['Tables']['inventory']['Insert'];
type InventoryUpdate = Database['public']['Tables']['inventory']['Update'];

export const inventoryService = {
  // Get all inventory items
  async getInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Get inventory item by ID
  async getInventoryItem(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new inventory item
  async createInventoryItem(item: InventoryInsert) {
    // Generate item code
    const itemCode = `INV-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        ...item,
        item_code: itemCode,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update inventory item
  async updateInventoryItem(id: string, updates: InventoryUpdate) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete inventory item
  async deleteInventoryItem(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get low stock items
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .filter('quantity', 'lte', 'min_stock')
      .order('quantity');
    
    if (error) throw error;
    return data;
  },

  // Update stock quantity
  async updateStock(id: string, quantity: number, transactionType: 'in' | 'out' | 'adjustment', notes?: string) {
    // Get current item
    const { data: item, error: itemError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .single();
    
    if (itemError) throw itemError;

    let newQuantity = item.quantity;
    if (transactionType === 'in') {
      newQuantity += quantity;
    } else if (transactionType === 'out') {
      newQuantity -= quantity;
    } else {
      newQuantity = quantity;
    }

    // Update inventory
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Record transaction
    await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: id,
        transaction_type: transactionType,
        quantity: transactionType === 'adjustment' ? quantity : 
                 transactionType === 'out' ? -quantity : quantity,
        notes,
      });

    return data;
  },

  // Get inventory statistics
  async getInventoryStats() {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('quantity, min_stock, unit_cost, category');
    
    if (error) throw error;

    const stats = {
      total_items: inventory.length,
      low_stock_items: inventory.filter(i => i.quantity <= i.min_stock).length,
      total_value: inventory.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
      categories: Array.from(new Set(inventory.map(i => i.category))).length,
      by_category: inventory.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },
};