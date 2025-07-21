import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type ExportOrder = Database['public']['Tables']['export_orders']['Row'];
type ExportOrderInsert = Database['public']['Tables']['export_orders']['Insert'];
type ExportOrderUpdate = Database['public']['Tables']['export_orders']['Update'];

export const exportService = {
  // Get all export orders
  async getExportOrders() {
    const { data, error } = await supabase
      .from('export_orders')
      .select(`
        *,
        orders (
          order_number,
          client_name,
          product_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get export order by ID
  async getExportOrder(id: string) {
    const { data, error } = await supabase
      .from('export_orders')
      .select(`
        *,
        orders (
          order_number,
          client_name,
          product_name,
          quantity,
          total_amount
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new export order
  async createExportOrder(exportOrder: ExportOrderInsert) {
    // Generate export number
    const exportNumber = `EXP-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabase
      .from('export_orders')
      .insert({
        ...exportOrder,
        export_number: exportNumber,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update export order
  async updateExportOrder(id: string, updates: ExportOrderUpdate) {
    const { data, error } = await supabase
      .from('export_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update tracking information
  async updateTracking(id: string, trackingNumber: string, carrier: string, status: string) {
    const { data, error } = await supabase
      .from('export_orders')
      .update({
        tracking_number: trackingNumber,
        carrier,
        status,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark as delivered
  async markAsDelivered(id: string, deliveryDate: string) {
    const { data, error } = await supabase
      .from('export_orders')
      .update({
        status: 'delivered',
        actual_delivery: deliveryDate,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get export statistics
  async getExportStats() {
    const { data: exports, error } = await supabase
      .from('export_orders')
      .select('status, value, destination_country, created_at');
    
    if (error) throw error;

    const stats = {
      total: exports.length,
      active: exports.filter(e => !['delivered', 'cancelled'].includes(e.status)).length,
      in_transit: exports.filter(e => e.status === 'in_transit').length,
      customs_clearance: exports.filter(e => e.status === 'customs_clearance').length,
      delivered: exports.filter(e => e.status === 'delivered').length,
      total_value: exports.reduce((sum, e) => sum + (e.value || 0), 0),
      by_country: exports.reduce((acc, exp) => {
        acc[exp.destination_country] = (acc[exp.destination_country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },

  // Get shipment tracking
  async getShipmentTracking(trackingNumber: string) {
    const { data, error } = await supabase
      .from('export_orders')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();
    
    if (error) throw error;
    return data;
  },
};