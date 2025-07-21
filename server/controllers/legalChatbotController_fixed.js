import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, checkSupabaseConnection } from '../config/supabase.js';

// Vérifier la connexion à Supabase au démarrage
checkSupabaseConnection().catch(console.error);

// Vérification de la clé API
if (!process.env.GEMINI_API_KEY) {
  console.error('ERREUR: La clé API Gemini n\'est pas configurée');
  process.exit(1);
}

// Initialisation du client Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fonction pour vérifier si un utilisateur est administrateur
async function isUserAdmin(userId) {
  console.log(`Vérification du rôle admin pour l'utilisateur ${userId}...`);
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    const isAdmin = data?.role === 'admin';
    console.log(`Rôle de l'utilisateur ${userId}: ${data?.role || 'non trouvé'}, Admin: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle admin:', {
      userId,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

// ... [le reste du code existant jusqu'à la fonction getMessages]

/**
 * Récupère les messages d'une conversation spécifique
 */
export async function getMessages(req, res) {
  const { id: conversationId } = req.params;
  const userId = req.user?.id;

  try {
    // Vérifier que l'utilisateur a accès à cette conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée ou accès refusé' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      body: req.body,
      user: req.user,
      timestamp: new Date().toISOString()
    });
    
    const errorResponse = {
      error: 'Erreur lors du traitement de la requête',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        code: error.code
      })
    };
    
    res.status(500).json(errorResponse);
  }
}

/**
 * Supprime une conversation (marquage comme inactif)
 */
export async function deleteConversation(req, res) {
  const { id: conversationId } = req.params;
  const userId = req.user?.id;

  try {
    // Vérifier que l'utilisateur est propriétaire de la conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (convError || !conversation || conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée ou accès refusé' });
    }

    // Mettre à jour la conversation comme inactive
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
