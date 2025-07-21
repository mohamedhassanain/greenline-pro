import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User as UserIcon, ChevronDown, HelpCircle } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import './LegalChatbot.css';

interface Message {
  role: 'user' | 'juridique' | 'support' | 'expert_technique' | 'system';
  content: string;
  timestamp?: Date;
}

type RoleType = 'juridique' | 'support' | 'expert_technique';

interface RoleConfig {
  name: string;
  description: string;
  color: string;
  systemPrompt: string;
  allowedRoles: string[];
}

const ROLE_CONFIG: Record<RoleType, RoleConfig> = {
  juridique: {
    name: 'Juridique',
    description: 'Expert en droit et réglementation',
    color: 'bg-blue-600',
    systemPrompt: `Tu es un expert juridique professionnel. 
      - Fournis des conseils juridiques précis et à jour
      - Mentionne toujours les références légales pertinentes
      - Sois clair et pédagogique dans tes explications
      - Pour les questions complexes, conseille de consulter un avocat spécialisé`,
    allowedRoles: ['user', 'admin']
  },
  support: {
    name: 'Support Client',
    description: 'Aide et assistance utilisateur',
    color: 'bg-green-600',
    systemPrompt: `Tu es un agent de support client attentionné et serviable.
      - Sois empathique et à l'écoute des besoins de l'utilisateur
      - Aide à résoudre les problèmes pratiques et les questions courantes
      - Guide l'utilisateur étape par étape dans ses démarches
      - Si tu ne connais pas la réponse, propose de transférer vers un expert`,
    allowedRoles: ['user', 'admin']
  },
  expert_technique: {
    name: 'Expert Technique',
    description: 'Spécialiste en solutions techniques',
    color: 'bg-purple-600',
    systemPrompt: `Tu es un expert technique hautement qualifié.
      - Fournis des réponses techniques précises et détaillées
      - Explique les concepts complexes de manière claire et structurée
      - Propose des solutions pratiques et des bonnes pratiques
      - N'hésite pas à demander des précisions si nécessaire`,
    allowedRoles: ['user', 'admin']
  }
};

export default function LegalChatbot() {
  const { session } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleType>('juridique');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{
    id: RoleType;
    name: string;
    description: string;
    color: string;
    allowed: boolean;
  }>>([]);
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roleSelectorRef = useRef<HTMLDivElement>(null);

  // Récupérer le rôle de l'utilisateur
  const userRole = session?.user?.role || 'user';
  const isAdmin = userRole === 'admin';
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!session?.user;

  // Fermer le sélecteur de rôles quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleSelectorRef.current && !roleSelectorRef.current.contains(event.target as Node)) {
        setShowRoleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Récupérer les rôles disponibles depuis le serveur
  useEffect(() => {
    const fetchAvailableRoles = async () => {
      console.log('=== Récupération des rôles côté frontend ===');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('session:', session);
      
      try {
        const response = await fetch('/api/chat/roles', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erreur API roles:', errorData);
          throw new Error(errorData.error || 'Erreur lors de la récupération des rôles');
        }
        
        const data = await response.json();
        console.log('Rôles reçus du serveur:', data);
        console.log('Type de données reçues:', typeof data);
        console.log('Est un tableau:', Array.isArray(data));
        
        // S'assurer que les données sont dans le bon format
        const formattedRoles = Array.isArray(data) ? data : [];
        console.log('Rôles formatés:', formattedRoles);
        
        setAvailableRoles(formattedRoles);
        
        // Mettre à jour le rôle actuel si nécessaire
        if (formattedRoles.length > 0) {
          console.log('Rôles disponibles après formatage:', formattedRoles);
          if (!formattedRoles.some((r: any) => r.id === currentRole)) {
            console.log(`Changement du rôle actuel de ${currentRole} à ${formattedRoles[0].id}`);
            setCurrentRole(formattedRoles[0].id as RoleType);
          }
        } else {
          console.warn('Aucun rôle disponible après formatage');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des rôles:', err);
        setError('Impossible de charger les rôles disponibles');
      }
    };
    
    fetchAvailableRoles();
  }, []); // Supprimer la dépendance à isAuthenticated pour toujours charger les rôles

  // Effet pour le défilement automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      const defaultRole = availableRoles.length > 0 ? availableRoles[0].id : 'juridique';
      setCurrentRole(defaultRole as RoleType);
      
      setMessages([{
        role: defaultRole as RoleType,
        content: `Bonjour ! Je suis votre assistant ${ROLE_CONFIG[defaultRole as RoleType]?.name || 'juridique'}. Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date()
      }]);
    }
  }, [availableRoles]);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('supabase.auth.token') || '';
  }, []);

  // Fonction pour vérifier si l'utilisateur peut utiliser un rôle
  const canUseRole = useCallback((role: RoleType) => {
    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) return false;
    
    // En mode développement, permettre tous les rôles
    if (process.env.NODE_ENV === 'development') return true;
    
    // Les admins peuvent tout faire
    if (isAdmin) return true;
    
    // Vérifie si le rôle est autorisé pour l'utilisateur
    return roleConfig.allowedRoles.includes(userRole) || 
           roleConfig.allowedRoles.includes('*');
  }, [isAdmin, userRole]);

  // Gestion du changement de rôle avec feedback visuel et confirmation
  const handleRoleChange = async (role: RoleType) => {
    if (!canUseRole(role)) {
      setError(`Vous n'avez pas la permission d'utiliser le rôle ${ROLE_CONFIG[role].name}`);
      return;
    }
    
    setLoading(true);
    try {
      setCurrentRole(role);
      setShowRoleSelector(false);
      
      // Ajout d'un message de confirmation de changement de rôle
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Vous êtes maintenant en conversation avec un expert en ${ROLE_CONFIG[role].name}.`,
        timestamp: new Date()
      }]);
      
      // Sauvegarder le dernier rôle utilisé dans le localStorage
      localStorage.setItem('lastUsedRole', role);
      
      // Jouer un son de feedback (optionnel)
      playRoleChangeSound();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      setError('Une erreur est survenue lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion de la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent, role: RoleType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleChange(role);
    }
  };
  
  // Effet sonore lors du changement de rôle
  const playRoleChangeSound = () => {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  // Récupérer le dernier rôle utilisé au chargement du composant
  useEffect(() => {
    const lastUsedRole = localStorage.getItem('lastUsedRole') as RoleType | null;
    if (lastUsedRole && canUseRole(lastUsedRole)) {
      setCurrentRole(lastUsedRole);
    }
  }, [canUseRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!input.trim() || loading) return;
    
    // Vérifier les permissions avant d'envoyer
    if (!canUseRole(currentRole)) {
      setError('Vous n\'avez pas la permission d\'utiliser ce rôle');
      setCurrentRole('juridique');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Utiliser la bonne URL d'API qui correspond au backend
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${getAuthToken()}` })
        },
        body: JSON.stringify({
          message: input,
          role: currentRole,
          messages: updatedMessages.slice(-10) // Limiter l'historique pour éviter les payloads trop gros
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API détaillée:', errorData);
        
        // Afficher des messages d'erreur plus spécifiques
        let errorMessage = 'Erreur lors de la communication avec le serveur';
        if (errorData.code === 'INVALID_ROLE') {
          errorMessage = `Rôle invalide: ${currentRole}. Rôles disponibles: ${errorData.validRoles?.join(', ') || 'aucun'}`;
        } else if (errorData.code === 'INVALID_MESSAGE') {
          errorMessage = 'Le message envoyé est invalide';
        } else if (errorData.details) {
          errorMessage = `Erreur: ${errorData.details}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Vérifier que la réponse contient bien les données attendues
      if (!data.success) {
        throw new Error(data.error || 'Réponse invalide du serveur');
      }
      
      const aiResponse = data.reply || data.response;
      if (!aiResponse) {
        throw new Error('Aucune réponse reçue de l\'IA');
      }
      
      setMessages(prev => [...prev, {
        role: currentRole,
        content: aiResponse,
        timestamp: new Date()
      }]);
      
    } catch (err) {
      console.error('Erreur complète:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      
      // Ajouter un message d'erreur dans la conversation pour plus de clarté
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Erreur: ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* En-tête avec sélecteur de rôle */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Assistance en ligne</h2>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Aide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative" ref={roleSelectorRef}>
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-haspopup="listbox"
              aria-expanded={showRoleSelector}
              aria-label={`Rôle actuel: ${ROLE_CONFIG[currentRole].name}. Cliquez pour changer de rôle`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${ROLE_CONFIG[currentRole].color}`}></span>
                {ROLE_CONFIG[currentRole].name}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showRoleSelector ? 'transform rotate-180' : ''}`} />
            </button>
            
            {showRoleSelector && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                role="listbox"
                aria-label="Sélectionnez un rôle"
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      onKeyDown={(e) => handleKeyDown(e, role.id)}
                      disabled={!role.allowed}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        role.allowed ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
                      } ${currentRole === role.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''} focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700`}
                      role="option"
                      aria-selected={currentRole === role.id}
                      aria-disabled={!role.allowed}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${role.color}`}></div>
                        <div>
                          <div className="font-medium flex items-center">
                            {role.name}
                            {!role.allowed && <span className="ml-1 text-xs" aria-hidden="true">🔒</span>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{role.description}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    Aucun rôle disponible
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Message d'aide */}
        {showHelp && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg">
            <p className="font-medium mb-1">Comment utiliser l'assistance :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Choisissez un expert en cliquant sur le menu déroulant</li>
              <li>Posez votre question dans le champ de texte ci-dessous</li>
              <li>L'expert vous répondra dans les plus brefs délais</li>
            </ul>
          </div>
        )}
        
        {error && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 dark:text-gray-400">
            <Bot className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-medium mb-2">Bienvenue sur l'assistance</h3>
            <p className="max-w-md">Sélectionnez un expert et commencez à discuter. Nous sommes là pour vous aider !</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <React.Fragment key={index}>
              {message.role === 'system' ? (
                <div className="flex justify-center">
                  <div className="system-message text-sm text-gray-600 dark:text-gray-300">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`flex max-w-[85%] rounded-lg p-4 transition-all duration-200 ${
                      message.role === 'user' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <>
                        <div className="flex-1">
                          <div className="font-medium mb-1 text-blue-700 dark:text-blue-300">Vous</div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-1">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        <div className="w-8 h-8 ml-3 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-3 w-full">
                        <div className={`w-8 h-8 rounded-full ${ROLE_CONFIG[message.role as RoleType]?.color || 'bg-gray-500'} text-white flex items-center justify-center flex-shrink-0`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium mb-1 text-gray-800 dark:text-gray-200">
                            {ROLE_CONFIG[message.role as RoleType]?.name || 'Assistant'}
                          </div>
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Posez votre question à l'expert ${ROLE_CONFIG[currentRole].name}...`}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              disabled={loading}
              aria-label="Votre message"
              aria-describedby="send-button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !loading) {
                    handleSubmit(e as any);
                  }
                }
              }}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Effacer le message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            id="send-button"
            disabled={!input.trim() || loading}
            className={`px-5 py-3 rounded-lg text-white flex items-center justify-center ${
              !input.trim() || loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
            aria-label="Envoyer le message"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Envoyer</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>L'assistance est assurée par une IA. Les réponses peuvent contenir des erreurs.</p>
        </div>
      </div>
    </div>
  );
}
