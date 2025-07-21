import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

console.log('=== Démarrage du serveur avec débogage ===');
console.log('Chemin du fichier .env:', envPath);

// Charger le fichier .env
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Erreur lors du chargement du fichier .env:', result.error);
    process.exit(1);
  }
  console.log('Fichier .env chargé avec succès');
  console.log('Variables chargées:', Object.keys(result.parsed || {}));
} catch (error) {
  console.error('Erreur fatale lors du chargement du fichier .env:', error);
  process.exit(1);
}

// Afficher les variables critiques (masquées pour la sécurité)
console.log('\n=== Configuration du serveur ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'non défini');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'non défini');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'non défini');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet de promesse non géré:', reason);
  console.error('Promesse rejetée:', promise);
  process.exit(1);
});

// Importer et démarrer le serveur
async function startServer() {
  try {
    console.log('\n=== Démarrage du serveur ===');
    console.log('Importation du module serveur...');
    
    // Vérifier les variables d'environnement critiques
    console.log('\n=== Vérification des variables d\'environnement ===');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    const port = parseInt(process.env.PORT || '3001', 10);
    console.log('PORT:', port);
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'non défini');
    
    // Importer le module serveur
    console.log('\n=== Importation du module serveur... ===');
    const { app, startServer } = await import('./server/server.js');
    
    if (!app) {
      throw new Error('L\'application Express n\'a pas été correctement exportée');
    }
    
    console.log(`\n=== Configuration du serveur ===`);
    console.log(`Port du serveur: ${port}`);
    
    // Démarrer le serveur
    console.log('\n=== Démarrage du serveur HTTP... ===');
    await startServer();
    
    // Gestion des erreurs du serveur
    server.on('error', (error) => {
      console.error('\n=== ERREUR du serveur ===');
      console.error('Code d\'erreur:', error.code || 'N/A');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`\nERREUR: Le port ${port} est déjà utilisé.`);
        console.log('\nPour résoudre ce problème:');
        console.log('1. Trouvez et arrêtez le processus qui utilise le port:');
        console.log('   Sur Windows: netstat -ano | findstr :<port>');
        console.log('   Puis: taskkill /F /PID <PID>');
        console.log('2. Ou démarrez le serveur sur un autre port:');
        console.log('   $env:PORT=4000; node start-server.js');
      } else if (error.code === 'EACCES') {
        console.error(`\nERREUR: Permission refusée pour le port ${port}.`);
        console.log('\nLes ports en dessous de 1024 nécessitent des privilèges administrateur.');
        console.log('Utilisez un port au-dessus de 1024:');
        console.log('   $env:PORT=4000; node start-server.js');
      } else {
        console.error('\nERREUR INATTENDUE du serveur');
        console.log('\nDétails complets de l\'erreur:');
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }
      
      process.exit(1);
    });
    
    console.log('Démarrage du serveur...');
    server.listen(port, () => {
      console.log(`\n=== Serveur démarré sur le port ${port} ===`);
      console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL du frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('=== Prêt à recevoir des requêtes ===\n');
    });
    
    // Gestion des arrêts gracieux
    const gracefulShutdown = () => {
      console.log('\n=== Arrêt gracieux du serveur en cours... ===');
      server.close(() => {
        console.log('Serveur arrêté avec succès');
        process.exit(0);
      });
      
      // Forcer l'arrêt après 5 secondes
      setTimeout(() => {
        console.error('Forçage de l\'arrêt du serveur...');
        process.exit(1);
      }, 5000);
    };
    
    // Gestion des signaux d'arrêt
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('\n=== ERREUR lors du démarrage du serveur ===');
    console.error('Erreur:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

startServer();
