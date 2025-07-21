import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Communication = Database['public']['Tables']['communications']['Row'];
type CommunicationInsert = Database['public']['Tables']['communications']['Insert'];

export const communicationService = {
  // Get all conversations
  async getConversations() {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Group by conversation_id and get latest message for each
    const conversations = data.reduce((acc, message) => {
      if (!acc[message.conversation_id] || 
          new Date(message.created_at) > new Date(acc[message.conversation_id].created_at)) {
        acc[message.conversation_id] = message;
      }
      return acc;
    }, {} as Record<string, Communication>);

    return Object.values(conversations);
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Send message
  async sendMessage(message: CommunicationInsert) {
    const { data, error } = await supabase
      .from('communications')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark messages as read
  async markAsRead(conversationId: string) {
    const { error } = await supabase
      .from('communications')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'client');
    
    if (error) throw error;
  },

  // Get unread message count
  async getUnreadCount() {
    const { count, error } = await supabase
      .from('communications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('sender_type', 'client');
    
    if (error) throw error;
    return count || 0;
  },

  // Create new conversation
  async createConversation(clientName: string, initialMessage: string) {
    const conversationId = `conv-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('communications')
      .insert({
        conversation_id: conversationId,
        sender_type: 'client',
        sender_name: clientName,
        message: initialMessage,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search conversations
  async searchConversations(query: string) {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .or(`sender_name.ilike.%${query}%,message.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};