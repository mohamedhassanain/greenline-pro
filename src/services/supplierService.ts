import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export const supplierService = {
  // Get all suppliers
  async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Get supplier by ID
  async getSupplier(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new supplier
  async createSupplier(supplier: SupplierInsert) {
    // Generate supplier code
    const supplierCode = `SUP-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        supplier_code: supplierCode,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update supplier
  async updateSupplier(id: string, updates: SupplierUpdate) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete supplier (soft delete)
  async deleteSupplier(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get suppliers by category
  async getSuppliersByCategory(category: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update supplier rating
  async updateSupplierRating(id: string, rating: number, reliability: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ rating, reliability })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get supplier statistics
  async getSupplierStats() {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('category, rating, reliability, is_active');
    
    if (error) throw error;

    const activeSuppliers = suppliers.filter(s => s.is_active);
    
    const stats = {
      total: activeSuppliers.length,
      average_rating: activeSuppliers.reduce((sum, s) => sum + s.rating, 0) / activeSuppliers.length,
      by_category: activeSuppliers.reduce((acc, supplier) => {
        acc[supplier.category] = (acc[supplier.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_reliability: activeSuppliers.reduce((acc, supplier) => {
        acc[supplier.reliability] = (acc[supplier.reliability] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },
};