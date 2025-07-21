// Script de débogage pour le serveur
import './server/server.js';

console.log('=== Démarrage du serveur en mode débogage ===');
console.log('Node.js version:', process.version);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 3001);

// Forcer le port 3002 pour éviter les conflits
process.env.PORT = '3002';

// Le serveur se lance automatiquement via les instructions dans server.js
