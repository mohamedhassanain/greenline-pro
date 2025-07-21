import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, checkSupabaseConnection } from '../config/supabase.js';

// Vérifier la connexion à Supabase au démarrage
checkSupabaseConnection().catch(console.error);

// Utilisation de la clé API Gemini fournie
const GEMINI_API_KEY = 'AIzaSyBylo6GnAN7wNVt-yX4N5pDzbE1rT_sRyA';

// Initialisation du client Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log('API Gemini initialisée avec la clé fournie');

// Configuration des rôles de l'agent AI
const AGENT_ROLES = {
  JURIDIQUE: 'juridique',
  SUPPORT: 'support',
  EXPERT_TECHNIQUE: 'expert_technique'
};

// Configuration des rôles avec leurs prompts système et permissions
const ROLE_CONFIG = {
  [AGENT_ROLES.JURIDIQUE]: {
    name: 'Juridique',
    description: 'Expert en droit et réglementation',
    systemPrompt: `Tu es un expert juridique professionnel. 
      - Fournis des conseils juridiques précis et à jour
      - Mentionne toujours les références légales pertinentes
      - Sois clair et pédagogique dans tes explications`,
    color: 'bg-blue-600',
    allowedRoles: ['user', 'admin']
  },
  [AGENT_ROLES.SUPPORT]: {
    name: 'Support Client',
    description: 'Aide et assistance utilisateur',
    systemPrompt: `Tu es un agent de support client attentionné et serviable.
      - Sois empathique et à l'écoute des besoins de l'utilisateur
      - Aide à résoudre les problèmes pratiques et les questions courantes`,
    color: 'bg-green-600',
    allowedRoles: ['user', 'admin']
  },
  [AGENT_ROLES.EXPERT_TECHNIQUE]: {
    name: 'Expert Technique',
    description: 'Spécialiste en solutions techniques',
    systemPrompt: `Tu es un expert technique hautement qualifié.
      - Fournis des réponses techniques précises et détaillées
      - Explique les concepts complexes de manière claire`,
    color: 'bg-purple-600',
    allowedRoles: ['user', 'admin']
  }
};

// Vérifie si un rôle est valide
function isValidRole(role) {
  return Object.values(AGENT_ROLES).includes(role);
}

// Vérifie si un utilisateur a la permission d'utiliser un rôle
async function canUseRole(userId, role) {
  try {
    // En mode développement, permettre l'accès à tous les rôles
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Accès accordé pour le rôle ${role} (mode développement)`);
      return true;
    }

    // Vérifier si l'utilisateur est connecté
    if (!userId) {
      console.log('Accès refusé : utilisateur non connecté');
      return false;
    }

    // Récupérer le rôle de l'utilisateur depuis la base de données
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Erreur lors de la récupération du rôle utilisateur:', userError?.message);
      return false;
    }

    const userRole = userData.role || 'user';
    const roleConfig = ROLE_CONFIG[role];

    // Vérifier si le rôle demandé existe et est autorisé pour le rôle de l'utilisateur
    if (roleConfig && roleConfig.allowedRoles.includes(userRole)) {
      console.log(`Accès accordé : ${userRole} peut utiliser le rôle ${role}`);
      return true;
    }

    console.log(`Accès refusé : ${userRole} n'a pas la permission d'utiliser le rôle ${role}`);
    return false;
  } catch (error) {
    console.error('Erreur dans canUseRole:', error);
    return false;
  }
}

// Récupère les rôles disponibles
export const getAvailableRoles = async (req, res) => {
  try {
    console.log('=== Récupération des rôles disponibles ===');
    console.log('req.user:', req.user);
    console.log('Headers:', req.headers);
    
    // Mode développement : permettre l'accès même sans authentification complète
    const userId = req.user?.id || 'dev-user-123';
    const userRole = req.user?.role || 'admin'; // Donner les droits admin par défaut
    const isAdmin = userRole === 'admin';
    
    console.log(`Récupération des rôles pour l'utilisateur ${userId} (rôle: ${userRole}, admin: ${isAdmin})`);

    // Récupérer TOUS les rôles disponibles (mode développement)
    const roles = Object.entries(ROLE_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
      color: config.color,
      allowed: true
    }));

    console.log('Rôles disponibles:', roles);

    res.json(roles); // Retourner directement le tableau pour compatibilité frontend

  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    
    // En cas d'erreur, retourner tous les rôles quand même
    const fallbackRoles = Object.entries(ROLE_CONFIG).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
      color: config.color,
      allowed: true
    }));
    
    res.json(fallbackRoles);
  }
};

// Fonction pour vérifier si un utilisateur est administrateur
async function isUserAdmin(userId) {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
    
    return data.role === 'admin';
  } catch (error) {
    console.error('Erreur inattendue lors de la vérification du rôle admin:', error);
    return false;
  }
}

// Traite un message utilisateur
export const sendMessage = async (req, res) => {
  try {
    console.log('=== Nouveau message reçu ===');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { message, role = AGENT_ROLES.JURIDIQUE, messages = [] } = req.body;

    // Validation du message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('Message invalide reçu:', message);
      return res.status(400).json({ 
        success: false,
        error: 'Un message valide est requis',
        code: 'INVALID_MESSAGE'
      });
    }

    // Vérification du rôle
    if (!ROLE_CONFIG[role]) {
      console.error('Rôle invalide:', role);
      return res.status(400).json({ 
        success: false,
        error: `Rôle invalide. Rôles valides: ${Object.keys(ROLE_CONFIG).join(', ')}`,
        code: 'INVALID_ROLE',
        validRoles: Object.keys(ROLE_CONFIG)
      });
    }

    console.log(`Génération de la réponse avec le rôle: ${role}`);
    
    // Générer la réponse de l'IA avec contexte de conversation
    const response = await generateAIResponse(message, role, messages);
    
    if (!response) {
      throw new Error('Aucune réponse générée par le modèle');
    }

    console.log('Réponse générée avec succès');
    
    res.json({ 
      success: true,
      reply: response, // Utiliser 'reply' pour cohérence avec frontend
      response: response, // Garder aussi 'response' pour compatibilité
      role,
      timestamp: new Date().toISOString(),
      aiAgent: {
        name: ROLE_CONFIG[role].name,
        description: ROLE_CONFIG[role].description
      }
    });

  } catch (error) {
    console.error('Erreur lors du traitement du message:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Une erreur est survenue lors du traitement de votre message',
      details: error.message, // Toujours inclure les détails pour le debugging
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Génère une réponse de l'IA
async function generateAIResponse(message, role, messages = []) {
  try {
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide');
    }

    const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG[AGENT_ROLES.JURIDIQUE];
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    
    // Construire l'historique de conversation pour une meilleure interaction
    const chatHistory = [];
    
    // Ajouter le prompt système comme premier message
    chatHistory.push({
      role: 'user',
      parts: [{ text: roleConfig.systemPrompt }]
    });
    
    // Ajouter l'historique des messages précédents (limité aux 10 derniers pour éviter les tokens excessifs)
    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        chatHistory.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.role !== 'system') {
        chatHistory.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Créer une conversation avec l'historique
    const chat = model.startChat({
      history: chatHistory
    });

    // Envoyer le message et obtenir la réponse
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Aucune réponse reçue du modèle');
    }

    // Ajouter une signature personnalisée selon le rôle pour améliorer l'interaction
    const signature = `\n\n---\n*${roleConfig.name}* - ${roleConfig.description}`;
    return responseText + signature;
    
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse AI:', error);
    
    // Retourner une erreur plus détaillée pour le debugging
    if (error.message.includes('API_KEY')) {
      return `Erreur de configuration API. Veuillez vérifier la clé API Gemini.`;
    } else if (error.message.includes('quota')) {
      return `Quota API dépassé. Veuillez réessayer plus tard.`;
    } else {
      return `Désolé, une erreur s'est produite lors de la génération de la réponse: ${error.message}`;
    }
  }
}

/**
 * Récupère la liste des conversations d'un utilisateur
 */
export async function getConversations(req, res) {
  const userId = req.user?.id;
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

  console.log(`[${requestId}] Récupération des conversations pour l'utilisateur ${userId}`);
  
  if (!userId) {
    console.error(`[${requestId}] Erreur: Aucun ID utilisateur fourni`);
    return res.status(401).json({ 
      error: 'Non authentifié',
      requestId
    });
  }

  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(`[${requestId}] Erreur Supabase:`, error);
      throw new Error('Erreur lors de la récupération des conversations');
    }

    console.log(`[${requestId}] ${conversations?.length || 0} conversations récupérées`);
    res.json(conversations || []);
  } catch (error) {
    console.error(`[${requestId}] Erreur:`, error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération des conversations',
      requestId
    });
  }
}

/**
 * Récupère les messages d'une conversation spécifique
 */
export async function getMessages(req, res) {
  const { id: conversationId } = req.params;
  const userId = req.user?.id;
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

  console.log(`[${requestId}] Récupération des messages pour la conversation ${conversationId}`);
  
  if (!conversationId) {
    console.error(`[${requestId}] Erreur: Aucun ID de conversation fourni`);
    return res.status(400).json({ 
      error: 'ID de conversation manquant',
      requestId
    });
  }

  try {
    // Vérifier que la conversation existe
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error(`[${requestId}] Conversation non trouvée:`, convError);
      return res.status(404).json({ 
        error: 'Conversation non trouvée',
        requestId
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de la conversation ou un admin
    const isAdmin = await isUserAdmin(userId);
    if (conversation.user_id !== userId && !isAdmin) {
      console.error(`[${requestId}] Accès non autorisé à la conversation`);
      return res.status(403).json({ 
        error: 'Accès non autorisé',
        requestId
      });
    }

    // Récupérer les messages de la conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error(`[${requestId}] Erreur lors de la récupération des messages:`, messagesError);
      throw new Error('Erreur lors de la récupération des messages');
    }

    console.log(`[${requestId}] ${messages?.length || 0} messages récupérés`);
    res.json(messages || []);
  } catch (error) {
    console.error(`[${requestId}] Erreur:`, error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la récupération des messages',
      requestId
    });
  }
}

/**
 * Gère les requêtes de chat avec l'agent AI
 */
export async function handleLegalChatbot(req, res) {
  const { message, conversationId, role } = req.body;
  const userId = req.user?.id;
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

  console.log(`[${requestId}] Nouvelle requête de chat - Utilisateur: ${userId}, Conversation: ${conversationId}, Rôle: ${role}`);
  
  // Validation des entrées
  if (!message?.trim()) {
    console.error(`[${requestId}] Message vide reçu`);
    return res.status(400).json({ 
      error: 'Le message ne peut pas être vide',
      requestId
    });
  }

  if (!isValidRole(role)) {
    console.error(`[${requestId}] Rôle invalide: ${role}`);
    return res.status(400).json({ 
      error: 'Rôle invalide',
      requestId
    });
  }

  try {
    // Vérifier les permissions de l'utilisateur pour ce rôle
    const userCanUseRole = await canUseRole(userId, role);
    if (!userCanUseRole) {
      console.error(`[${requestId}] L'utilisateur n'a pas la permission d'utiliser ce rôle`);
      return res.status(403).json({ 
        error: 'Accès non autorisé à ce rôle',
        requestId
      });
    }

    // Récupérer ou créer la conversation
    let conversation = null;
    if (conversationId) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error || !data) {
        console.error(`[${requestId}] Erreur lors de la récupération de la conversation:`, error);
        return res.status(404).json({ 
          error: 'Conversation non trouvée',
          requestId
        });
      }

      // Vérifier que l'utilisateur est le propriétaire de la conversation ou un admin
      const isAdmin = await isUserAdmin(userId);
      if (data.user_id !== userId && !isAdmin) {
        console.error(`[${requestId}] Accès non autorisé à la conversation`);
        return res.status(403).json({ 
          error: 'Accès non autorisé',
          requestId
        });
      }

      conversation = data;
    } else {
      // Créer une nouvelle conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { 
            user_id: userId,
            title: `Nouvelle conversation - ${new Date().toLocaleString()}`,
            role: role
          }
        ])
        .select()
        .single();

      if (error) {
        console.error(`[${requestId}] Erreur lors de la création de la conversation:`, error);
        throw new Error('Erreur lors de la création de la conversation');
      }

      conversation = data;
    }

    // Enregistrer le message de l'utilisateur
    const { data: userMessage, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          metadata: { role }
        }
      ])
      .select()
      .single();

    if (messageError) {
      console.error(`[${requestId}] Erreur lors de l'enregistrement du message utilisateur:`, messageError);
      throw new Error('Erreur lors de l\'enregistrement du message');
    }

    // Préparer l'historique de la conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error(`[${requestId}] Erreur lors de la récupération de l'historique:`, messagesError);
      throw new Error('Erreur lors de la récupération de l\'historique de la conversation');
    }

    // Préparer le contexte pour l'IA
    const systemPrompt = ROLE_CONFIG[role]?.systemPrompt || ROLE_CONFIG[AGENT_ROLES.JURIDIQUE].systemPrompt;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Formater les messages pour l'API Gemini
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Ajouter le prompt système comme premier message
    chatHistory.unshift({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });

    // Générer la réponse avec l'IA
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = await result.response.text();

    // Enregistrer la réponse de l'IA
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversation.id,
          role: role,
          content: responseText,
          metadata: { role }
        }
      ])
      .select()
      .single();

    if (aiMessageError) {
      console.error(`[${requestId}] Erreur lors de l'enregistrement de la réponse de l'IA:`, aiMessageError);
      throw new Error('Erreur lors de l\'enregistrement de la réponse de l\'IA');
    }

    // Mettre à jour la date de mise à jour de la conversation
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    console.log(`[${requestId}] Réponse générée avec succès`);
    res.json({
      conversationId: conversation.id,
      message: aiMessage,
      requestId
    });
  } catch (error) {
    console.error(`[${requestId}] Erreur lors du traitement de la requête:`, error);
    
    // En cas d'erreur, essayer de fournir une réponse d'erreur appropriée
    let errorMessage = 'Une erreur est survenue lors du traitement de votre demande';
    let statusCode = 500;

    if (error.message.includes('quota')) {
      errorMessage = 'Le quota de l\'API a été dépassé. Veuillez réessayer plus tard.';
      statusCode = 429;
    } else if (error.message.includes('API key')) {
      errorMessage = 'Erreur de configuration du serveur. Veuillez contacter l\'administrateur.';
      statusCode = 500;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      requestId
    });
  }
}

/**
 * Supprime une conversation (marquage comme inactif)
 */
export async function deleteConversation(req, res) {
  const { id: conversationId } = req.params;
  const userId = req.user?.id;
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

  console.log(`[${requestId}] Demande de suppression de la conversation ${conversationId} par l'utilisateur ${userId}`);
  
  if (!conversationId) {
    console.error(`[${requestId}] Erreur: Aucun ID de conversation fourni`);
    return res.status(400).json({ 
      error: 'ID de conversation manquant',
      requestId
    });
  }

  try {
    // Vérifier que la conversation existe
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      console.error(`[${requestId}] Conversation non trouvée:`, conversationError);
      return res.status(404).json({ 
        error: 'Conversation non trouvée',
        requestId
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de la conversation ou un admin
    const isAdmin = await isUserAdmin(userId);
    if (conversation.user_id !== userId && !isAdmin) {
      console.error(`[${requestId}] Tentative d'accès non autorisée à la conversation`);
      return res.status(403).json({ 
        error: 'Accès non autorisé',
        requestId
      });
    }

    // Marquer la conversation comme supprimée (soft delete)
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error(`[${requestId}] Erreur lors de la mise à jour de la conversation:`, updateError);
      throw new Error(`Erreur lors de la suppression de la conversation: ${updateError.message}`);
    }

    // Journaliser l'action
    console.log(`[${requestId}] Conversation ${conversationId} supprimée avec succès par l'utilisateur ${userId}`);
    
    res.json({ 
      success: true,
      message: 'Conversation supprimée avec succès',
      conversationId,
      deletedAt: new Date().toISOString(),
      requestId
    });
    
  } catch (error) {
    const errorDetails = {
      requestId,
      timestamp: new Date().toISOString(),
      userId,
      conversationId,
      error: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code })
    };

    console.error(`[${requestId}] Erreur lors de la suppression de la conversation:`, errorDetails);
    
    const errorResponse = {
      error: 'Erreur lors de la suppression de la conversation',
      message: error.message,
      requestId,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.details,
        stack: error.stack
      })
    };
    
    res.status(500).json(errorResponse);
  }
}

// Exporter les utilitaires pour les tests
// Note: Ces fonctions ne sont pas exportées dans le module ES par défaut
export const __test__ = {
  isValidRole,
  canUseRole,
  isUserAdmin,
  AGENT_ROLES,
  ROLE_CONFIG
};
