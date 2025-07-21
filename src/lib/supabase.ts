import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          full_name: string;
          role: string;
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string;
          full_name?: string;
          role?: string;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          full_name?: string;
          role?: string;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          client_name: string;
          client_email: string | null;
          client_phone: string | null;
          client_address: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_amount: number;
          status: string;
          priority: string;
          progress: number;
          deadline: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          client_name: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          product_name: string;
          quantity?: number;
          unit_price?: number;
          total_amount?: number;
          status?: string;
          priority?: string;
          progress?: number;
          deadline?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          client_name?: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_amount?: number;
          status?: string;
          priority?: string;
          progress?: number;
          deadline?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          item_code: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          min_stock: number;
          max_stock: number | null;
          unit_cost: number;
          supplier_id: string | null;
          location: string | null;
          last_restocked: string | null;
          created_at: string;
          updated_at: string;
          priority: string | null;
          status: string | null;
        };
        Insert: {
          id?: string;
          item_code: string;
          name: string;
          category: string;
          quantity?: number;
          unit?: string;
          min_stock?: number;
          max_stock?: number | null;
          unit_cost?: number;
          supplier_id?: string | null;
          location?: string | null;
          last_restocked?: string | null;
          created_at?: string;
          updated_at?: string;
          priority?: string | null;
          status?: string | null;
        };
        Update: {
          id?: string;
          item_code?: string;
          name?: string;
          category?: string;
          quantity?: number;
          unit?: string;
          min_stock?: number;
          max_stock?: number | null;
          unit_cost?: number;
          supplier_id?: string | null;
          location?: string | null;
          last_restocked?: string | null;
          created_at?: string;
          updated_at?: string;
          priority?: string | null;
          status?: string | null;
        };
      };
      suppliers: {
        Row: {
          id: string;
          supplier_code: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          category: string;
          rating: number;
          reliability: string;
          payment_terms: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_code: string;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          category: string;
          rating?: number;
          reliability?: string;
          payment_terms?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_code?: string;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          category?: string;
          rating?: number;
          reliability?: string;
          payment_terms?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      communications: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: string;
          sender_name: string;
          message: string;
          attachments: any;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: string;
          sender_name: string;
          message: string;
          attachments?: any;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: string;
          sender_name?: string;
          message?: string;
          attachments?: any;
          is_read?: boolean;
          created_at?: string;
        };
      };
      export_orders: {
        Row: {
          id: string;
          export_number: string;
          order_id: string | null;
          client_name: string;
          destination_country: string;
          destination_address: string;
          product_description: string;
          quantity: number;
          weight: number | null;
          value: number | null;
          currency: string;
          carrier: string | null;
          tracking_number: string | null;
          status: string;
          estimated_delivery: string | null;
          actual_delivery: string | null;
          documents: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          export_number: string;
          order_id?: string | null;
          client_name: string;
          destination_country: string;
          destination_address: string;
          product_description: string;
          quantity: number;
          weight?: number | null;
          value?: number | null;
          currency?: string;
          carrier?: string | null;
          tracking_number?: string | null;
          status?: string;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          documents?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          export_number?: string;
          order_id?: string | null;
          client_name?: string;
          destination_country?: string;
          destination_address?: string;
          product_description?: string;
          quantity?: number;
          weight?: number | null;
          value?: number | null;
          currency?: string;
          carrier?: string | null;
          tracking_number?: string | null;
          status?: string;
          estimated_delivery?: string | null;
          actual_delivery?: string | null;
          documents?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: number;
          title: string;
          description: string;
          assigned_to: string;
          status: string;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          assigned_to: string;
          status?: string;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          assigned_to?: string;
          status?: string;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}