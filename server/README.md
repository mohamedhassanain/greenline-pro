# GreenLine Pro Backend

Backend API complet pour l'application GreenLine Pro - Système de gestion de production textile.

## 🚀 Fonctionnalités

### Authentification & Autorisation
- ✅ Inscription/Connexion avec JWT
- ✅ Gestion des rôles (admin, manager, user)
- ✅ Protection des routes
- ✅ Gestion des profils utilisateurs

### Gestion des Commandes
- ✅ CRUD complet des commandes
- ✅ Suivi du statut et progression
- ✅ Gestion des priorités
- ✅ Statistiques et rapports
- ✅ Recherche et filtrage

### Gestion des Stocks
- ✅ Inventaire complet
- ✅ Alertes de stock faible
- ✅ Transactions de stock
- ✅ Catégorisation
- ✅ Intégration fournisseurs

### Gestion des Fournisseurs
- ✅ Base de données fournisseurs
- ✅ Évaluations et fiabilité
- ✅ Catégorisation
- ✅ Statistiques

### Communication Temps Réel
- ✅ WebSocket avec Socket.IO
- ✅ Notifications en temps réel
- ✅ Chat client intégré

## 🛠️ Technologies Utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Socket.IO** - Communication temps réel
- **Bcrypt** - Hachage des mots de passe
- **Joi** - Validation des données
- **Helmet** - Sécurité
- **CORS** - Cross-Origin Resource Sharing

## 📦 Installation

1. **Cloner et installer les dépendances**
```bash
cd server
npm install
```

2. **Configuration de la base de données**
```bash
# Créer une base de données PostgreSQL
createdb greenline_pro

# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables d'environnement
nano .env
```

3. **Variables d'environnement requises**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/greenline_pro
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenline_pro
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

4. **Exécuter les migrations**
```bash
npm run migrate
```

5. **Peupler la base de données (optionnel)**
```bash
npm run seed
```

6. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentification
```
POST /api/auth/register     - Inscription
POST /api/auth/login        - Connexion
GET  /api/auth/profile      - Profil utilisateur
PUT  /api/auth/profile      - Modifier profil
PUT  /api/auth/change-password - Changer mot de passe
```

### Commandes
```
GET    /api/orders          - Liste des commandes
GET    /api/orders/stats    - Statistiques commandes
GET    /api/orders/:id      - Détail commande
POST   /api/orders          - Créer commande
PUT    /api/orders/:id      - Modifier commande
DELETE /api/orders/:id      - Supprimer commande
```

### Inventaire
```
GET    /api/inventory       - Liste inventaire
GET    /api/inventory/stats - Statistiques inventaire
GET    /api/inventory/:id   - Détail article
POST   /api/inventory       - Créer article
PUT    /api/inventory/:id   - Modifier article
PUT    /api/inventory/:id/stock - Modifier stock
DELETE /api/inventory/:id   - Supprimer article
```

### Fournisseurs
```
GET    /api/suppliers       - Liste fournisseurs
GET    /api/suppliers/stats - Statistiques fournisseurs
GET    /api/suppliers/:id   - Détail fournisseur
POST   /api/suppliers       - Créer fournisseur
PUT    /api/suppliers/:id   - Modifier fournisseur
DELETE /api/suppliers/:id   - Supprimer fournisseur
```

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hachage bcrypt** pour les mots de passe
- **Validation Joi** pour toutes les entrées
- **Rate limiting** pour prévenir les attaques
- **Helmet.js** pour les en-têtes de sécurité
- **CORS** configuré correctement
- **Requêtes SQL paramétrées** contre l'injection SQL

## 📊 Base de Données

### Structure des Tables
- `users` - Utilisateurs et authentification
- `orders` - Commandes clients
- `suppliers` - Fournisseurs
- `inventory` - Articles en stock
- `inventory_transactions` - Mouvements de stock
- `communications` - Messages et conversations
- `export_orders` - Commandes d'export

### Indexes Optimisés
- Index sur les statuts et priorités
- Index sur les dates de création
- Index sur les catégories
- Index pour les recherches textuelles

## 🚀 Déploiement

### Variables d'environnement Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker (Optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Monitoring & Logs

- **Health Check** endpoint: `GET /health`
- **Morgan** pour les logs HTTP
- **Graceful shutdown** pour les signaux SIGTERM/SIGINT
- **Error handling** centralisé

## 🔧 Scripts Disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement
npm run migrate    # Exécuter les migrations
npm run seed       # Peupler la base de données
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**GreenLine Pro Backend** - Solution complète pour la gestion de production textile 🌱