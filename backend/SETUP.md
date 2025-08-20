# WikiPro Backend - Configuration et Démarrage

## 📋 Prérequis

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 8.0.0

## 🚀 Installation et Configuration

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration de la base de données PostgreSQL

#### Option A: Installation locale PostgreSQL

1. **Installer PostgreSQL** sur votre système
2. **Créer une base de données** pour WikiPro :

```sql
-- Se connecter à PostgreSQL en tant que superuser
sudo -u postgres psql

-- Créer la base de données
CREATE DATABASE wikipro_dev;

-- Créer l'utilisateur application
CREATE USER wikipro_app WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Accorder les permissions
GRANT ALL PRIVILEGES ON DATABASE wikipro_dev TO wikipro_app;
GRANT ALL ON SCHEMA public TO wikipro_app;

-- Sortir de psql
\q
```

#### Option B: Docker PostgreSQL (Recommandé pour le développement)

```bash
# Démarrer PostgreSQL avec Docker
docker run --name wikipro-postgres \
  -e POSTGRES_DB=wikipro_dev \
  -e POSTGRES_USER=wikipro_app \
  -e POSTGRES_PASSWORD=your_secure_password_here \
  -p 5432:5432 \
  -d postgres:15

# Vérifier que le container fonctionne
docker logs wikipro-postgres
```

### 3. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos valeurs
```

**Variables critiques à configurer :**

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=wikipro_app
DB_PASSWORD=your_secure_password_here
DB_NAME=wikipro_dev

# JWT (OBLIGATOIRE - Générer une clé sécurisée)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
```

### 4. Exécution des migrations de base de données

```bash
# Se connecter à PostgreSQL
psql -h localhost -U wikipro_app -d wikipro_dev

# Exécuter la migration 001 (tables de base)
\i src/database/migrations/001-create-tables.sql

# Exécuter la migration 002 (RLS - Row Level Security)
\i src/database/migrations/002-setup-rls.sql

# Sortir de psql
\q
```

## 🏃‍♂️ Démarrage du serveur

### Mode développement (avec hot-reload)

```bash
npm run start:dev
```

### Mode production

```bash
# Compiler le code
npm run build

# Démarrer en production
npm run start:prod
```

Le serveur démarrera sur **http://localhost:3001**

## 🧪 Tests

### Tests unitaires

```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

### Tests d'intégration des endpoints

```bash
# Tester les endpoints (serveur doit être démarré)
npm run test:endpoints

# Tests d'intégration complets (démarre le serveur automatiquement)
npm run test:integration
```

## 📡 Endpoints disponibles

### 🔐 Authentification

#### POST /api/auth/login
```json
{
  "email": "admin@demo-company.com",
  "password": "AdminDemo123!",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Réponse:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "admin@demo-company.com",
    "name": "Admin Demo",
    "role": "admin",
    "tenant_id": "tenant-uuid"
  },
  "access_token": "jwt-token",
  "tenant": {
    "id": "tenant-uuid",
    "name": "Demo Company",
    "slug": "demo-company"
  }
}
```

#### GET /api/auth/verify
```bash
# Headers requis
Authorization: Bearer <jwt-token>
```

### 🏢 Tenants

#### GET /api/tenants/:slug/profile
```bash
# Exemple
GET /api/tenants/demo-company/profile
Authorization: Bearer <jwt-token>
```

## 🔒 Sécurité Multi-tenant

### Isolation stricte
- **Chaque requête** est automatiquement filtrée par `tenant_id`
- **Row Level Security (RLS)** activé sur toutes les tables
- **JWT contient le tenant_id** pour isolation automatique
- **Accès cross-tenant impossible** (retourne 403 Forbidden)

### Architecture de sécurité
1. **Authentification JWT** avec tenant_id dans le payload
2. **Middleware tenant** vérifie l'appartenance sur chaque requête
3. **RLS PostgreSQL** empêche l'accès aux données d'autres tenants
4. **Guards NestJS** pour la protection des routes

## 🛠️ Données de test

Le système inclut un tenant de démonstration :

- **Tenant:** Demo Company (`demo-company`)
- **Admin:** admin@demo-company.com / AdminDemo123!
- **User:** user@demo-company.com / UserDemo123!

## 🐛 Dépannage

### Erreur de connexion base de données
```bash
# Vérifier que PostgreSQL fonctionne
pg_isready -h localhost -p 5432

# Tester la connexion
psql -h localhost -U wikipro_app -d wikipro_dev -c "SELECT version();"
```

### Erreur JWT
- Vérifiez que `JWT_SECRET` est défini dans `.env`
- La clé doit faire minimum 32 caractères
- Redémarrez le serveur après modification

### Tests qui échouent
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Recompiler
npm run build

# Relancer les tests
npm test
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3001
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows

# Changer le port dans .env
PORT=3002
```

## 📊 Critères de validation TICKET-BACKEND-001

✅ **Backend NestJS fonctionnel** sur port 3001  
✅ **JWT avec tenant_id** intégré dans payload  
✅ **Middleware isolation tenant** sur tous endpoints  
✅ **PostgreSQL connecté** avec TypeORM  
✅ **RLS configuré** pour isolation multi-tenant  
✅ **Tests unitaires** auth + intégration tenant passants  

### Endpoints requis implémentés :
✅ `POST /api/auth/login` - Authentification avec tenant_id  
✅ `GET /api/auth/verify` - Vérification JWT  
✅ `GET /api/tenants/:slug/profile` - Profil tenant  

### Performance et sécurité :
✅ **Temps réponse < 200ms** pour auth  
✅ **Isolation multi-tenant STRICTE** - aucun accès cross-tenant  
✅ **JWT payload** contient : { user_id, tenant_id, email, roles }  

## 📞 Support

Pour toute question technique :
1. Vérifier les logs : `docker logs wikipro-backend` (si Docker)
2. Consulter la documentation API : http://localhost:3001/api/docs (si Swagger activé)
3. Tests de santé : http://localhost:3001/api/auth/health