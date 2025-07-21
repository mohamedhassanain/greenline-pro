import { createClient } from '@supabase/supabase-js';
import config from './config.js';

// Afficher les informations de débogage
console.log('=== Configuration Supabase ===');
console.log('Environnement:', config.nodeEnv);

const { url: supabaseUrl, serviceRoleKey, anonKey } = config.supabase;
const supabaseKey = serviceRoleKey || anonKey;

console.log('Supabase URL from env:', supabaseUrl ? '***' + supabaseUrl.slice(-10) : 'undefined');
console.log('Supabase Key from env:', supabaseKey ? '***' + supabaseKey.slice(-4) : 'undefined');

// Afficher la configuration pour le débogage
console.log('Configuration Supabase:');
console.log('- URL:', supabaseUrl ? '✓ Définie' : '✗ Non définie');
console.log('- Clé API:', supabaseKey ? '✓ Définie' : '✗ Non définie');

if (!supabaseUrl || !supabaseKey) {
  const error = new Error('Configuration Supabase manquante. Veuillez définir les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.');
  console.error('❌ Erreur de configuration Supabase:', error.message);
  throw error;
}

// Créer le client Supabase
let supabase;
try {
  console.log('=== Debug Supabase Client Creation ===');
  console.log('Supabase URL length:', supabaseUrl?.length);
  console.log('Supabase URL type:', typeof supabaseUrl);
  console.log('Supabase URL starts with http:', supabaseUrl?.startsWith('http'));
  
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Client Supabase initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation du client Supabase:', error);
  throw error;
}

// Vérifier la connexion à Supabase
const checkSupabaseConnection = async () => {
  console.log('🔍 Vérification de la connexion à Supabase...');
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Erreur lors de la requête de test:', error);
      throw error;
    }
    
    console.log('✅ Connecté à Supabase avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error.message);
    console.error('Détails techniques:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message
    });
    throw error;
  }
};

// Exporter les éléments nécessaires
export { supabase, checkSupabaseConnection };

export default supabase;
