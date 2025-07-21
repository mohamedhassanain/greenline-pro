// Script pour vérifier le chargement des variables d'environnement
require('dotenv').config();

console.log('=== Vérification des variables d\'environnement ===');
console.log('Répertoire courant:', process.cwd());
console.log('Fichier .env chargé ?', process.env.DOTENV_LOADED || 'Non');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Définie' : '✗ Non définie');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Définie' : '✗ Non définie');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Définie' : '✗ Non définie');

// Afficher toutes les variables d'environnement (sans les valeurs pour des raisons de sécurité)
console.log('\n=== Variables d\'environnement chargées ===');
Object.keys(process.env)
  .filter(key => key.includes('SUPABASE') || key.includes('NODE_ENV') || key.includes('VITE'))
  .forEach(key => {
    console.log(`${key}: ${key.endsWith('_KEY') ? '***' + process.env[key]?.slice(-4) : process.env[key]}`);
  });
