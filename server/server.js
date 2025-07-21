import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { supabase } from './config/supabase.js';
import legalChatbotRoutes from './routes/legalChatbot.js';
import agendaRoutes from './routes/agenda.js';
import config from './config/config.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Configuration de base

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log des requêtes entrantes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware d'authentification optionnel (pour permettre l'accès sans auth en développement)
const optionalAuth = async (req, res, next) => {
  try {
    // En mode développement, permettre l'accès avec un utilisateur fictif
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        role: 'admin',
        full_name: 'Développeur',
        avatar_url: null
      };
      console.log('Mode développement - utilisateur fictif créé');
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('Aucun token fourni - accès en mode invité');
      req.user = { role: 'guest' };
      return next();
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Token invalide ou expiré - accès en mode invité');
      req.user = { role: 'guest' };
      return next();
    }

    // Récupérer les informations complètes du profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      req.user = { role: 'user' }; // Rôle par défaut
      return next();
    }

    // Vérifier et normaliser le rôle de l'utilisateur
    const userRole = profile?.role?.toLowerCase() || 'user';
    const validRoles = ['admin', 'user'];
    const normalizedRole = validRoles.includes(userRole) ? userRole : 'user';

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: normalizedRole,
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url
    };

    console.log('Utilisateur authentifié:', { 
      id: user.id, 
      role: req.user.role,
      email: user.email
    });
    
    next();
    
  } catch (error) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    // En cas d'erreur, utiliser le rôle invité
    req.user = { role: 'guest' };
    next();
  }
};

// Routes avec authentification optionnelle pour le développement
app.use('/api/chat', optionalAuth, legalChatbotRoutes);
app.use('/api/agenda', optionalAuth, agendaRoutes);

// Log des erreurs d'authentification
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('Erreur d\'authentification:', err);
    return res.status(401).json({ 
      error: 'Token invalide ou expiré',
      requiresAuth: true
    });
  }
  next(err);
});

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API du chatbot juridique opérationnelle',
    status: 'actif',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Une erreur est survenue sur le serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app for testing and for use in start-server.js
export { app };

// Create HTTP server
const server = createServer(app);

// Function to start the server
const startServer = () => {
  return new Promise((resolve, reject) => {
    server.on('error', (error) => {
      console.error('Server error:', error);
      reject(error);
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n=== Serveur démarré sur le port ${PORT} ===`);
      console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL du frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('=== Prêt à recevoir des requêtes ===\n');
      resolve(server);
    });
  });
};

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

// Only start the server if this file is run directly (not when imported)
if (process.env.NODE_ENV !== 'test' && !process.env.IS_CHILD_PROCESS) {
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  
  // Gestion des signaux d'arrêt
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

