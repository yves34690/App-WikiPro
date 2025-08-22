# 🗄️ GUIDE DE CONFIGURATION BASE DE DONNÉES - WIKIPRO

## 📋 Vue d'ensemble

Ce guide vous accompagne pour configurer PostgreSQL + TypeORM dans WikiPro Backend.

**Stack technique :**
- **PostgreSQL 15** avec Docker
- **TypeORM 0.3** pour l'ORM
- **pgAdmin** pour l'interface graphique
- **Multi-tenant** avec Row Level Security

---

## 🚀 INSTALLATION RAPIDE (3 ÉTAPES)

### **Étape 1: Configuration environnement**
```bash
# Dans le dossier backend/
cp .env.template .env

# Optionnel: personnaliser les variables dans .env
# Les valeurs par défaut fonctionnent pour le développement
```

### **Étape 2: Démarrer PostgreSQL**
```bash
# Depuis la racine du projet (où se trouve docker-compose.yml)
npm run docker:up

# Vérifier que PostgreSQL est prêt
npm run docker:logs
```

### **Étape 3: Initialiser la base**
```bash
# Dans le dossier backend/
npm run db:migrate
npm run db:seed
```

**✅ C'est prêt !** Votre base de données est configurée.

---

## 🔧 CONFIGURATION DÉTAILLÉE

### **Variables d'environnement (.env)**

```env
# Base de données principale
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wikipro_dev
DATABASE_USERNAME=wikipro_user
DATABASE_PASSWORD=wikipro_password

# TypeORM options
DATABASE_SYNCHRONIZE=true    # Auto-sync en développement
DATABASE_LOGGING=true        # Logs SQL en console
DATABASE_MIGRATIONS_RUN=true # Auto-run migrations

# JWT (requis pour l'auth)
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
```

### **Services Docker disponibles**

| Service | Port | Interface | Credentials |
|---------|------|-----------|-------------|
| PostgreSQL | 5432 | - | `wikipro_user / wikipro_password` |
| pgAdmin | 8080 | http://localhost:8080 | `admin@wikipro.dev / admin123` |
| Redis | 6379 | - | (pas de mot de passe) |

---

## 📊 COMMANDES NPM DISPONIBLES

### **🗄️ Base de données**
```bash
# Setup complet (création + migration + seed)
npm run db:setup

# Migrations
npm run db:migrate              # Appliquer les migrations
npm run db:migrate:revert       # Annuler la dernière migration
npm run db:generate Migration   # Générer nouvelle migration
npm run db:status              # Voir l'état des migrations

# Données de développement
npm run db:seed                # Insérer les données de test
npm run db:reset               # Reset complet (⚠️ supprime tout)
npm run db:drop                # Supprimer le schéma
```

### **🐳 Docker**
```bash
# Services
npm run docker:up              # Démarrer PostgreSQL + pgAdmin
npm run docker:down            # Arrêter les services
npm run docker:reset           # Reset complet avec suppression volumes

# Monitoring
npm run docker:logs            # Logs PostgreSQL
```

### **🔧 TypeORM CLI**
```bash
# CLI avancée
npm run typeorm -- --help                    # Aide TypeORM
npm run typeorm -- migration:create src/database/migrations/MyMigration
npm run typeorm -- schema:log               # Voir le schéma actuel
npm run typeorm -- query "SELECT version()"  # Exécuter une requête
```

---

## 📁 STRUCTURE DES FICHIERS

```
backend/
├── src/
│   ├── database/
│   │   ├── data-source.ts           # Configuration TypeORM CLI
│   │   ├── migrations/              # Fichiers de migration
│   │   │   └── 1692000000000-InitialSetup.ts
│   │   ├── entities/                # Entités TypeORM (futures)
│   │   └── seeds/                   # Données de développement
│   │       └── run-seeds.ts
│   └── app.module.ts                # Configuration TypeORM app
├── .env.template                    # Template variables env
├── .env.example                     # Exemple minimal
└── DATABASE_SETUP.md               # Ce guide
```

---

## 🛠️ UTILISATION PGADMIN

### **Connexion à pgAdmin**
1. Ouvrir http://localhost:8080
2. Email: `admin@wikipro.dev`
3. Password: `admin123`

### **Ajouter le serveur PostgreSQL**
1. Clic droit **Servers** > **Register** > **Server**
2. **General Tab :**
   - Name: `WikiPro Local`
3. **Connection Tab :**
   - Host: `postgres` (nom du service Docker)
   - Port: `5432`
   - Database: `wikipro_dev`
   - Username: `wikipro_user`
   - Password: `wikipro_password`

### **Exploration des données**
```
wikipro_dev/
├── Schemas/
│   └── public/
│       ├── Tables/
│       │   ├── tenants              # Organisations (multi-tenant)
│       │   ├── system_config        # Configuration globale
│       │   └── typeorm_migrations   # Historique migrations
│       └── Functions/
│           └── update_updated_at_column() # Trigger auto-update
```

---

## 🎯 DONNÉES DE DÉVELOPPEMENT

### **Tenant par défaut**
- **ID :** `f47ac10b-58cc-4372-a567-0e02b2c3d479`
- **Slug :** `dev`
- **Nom :** `WikiPro Development`
- **Domain :** `localhost`

### **Configuration système**
- Version app: `1.0.0`
- Mode maintenance: `false`
- Max users par tenant: `100`
- Rôle utilisateur défaut: `user`

---

## 🚨 RÉSOLUTION DE PROBLÈMES

### **Erreur: "database does not exist"**
```bash
# Vérifier que PostgreSQL est démarré
npm run docker:logs

# Recréer la base de données
npm run docker:reset
npm run db:setup
```

### **Erreur: "connection refused"**
```bash
# Vérifier les ports
docker ps

# Vérifier les variables d'environnement
cat .env | grep DATABASE
```

### **Erreur: "migration already exists"**
```bash
# Voir l'état des migrations
npm run db:status

# Forcer la synchronisation
npm run db:drop
npm run db:migrate
```

### **Reset total en cas de problème**
```bash
# ⚠️ ATTENTION: Supprime toutes les données
npm run docker:reset
npm run db:setup
```

---

## 🔒 SÉCURITÉ MULTI-TENANT

### **Isolation des données**
- Toutes les tables métier ont un champ `tenant_id`
- Row Level Security activé (RLS)
- Index optimisés pour les requêtes par tenant

### **Extensions PostgreSQL activées**
- `uuid-ossp` : Génération UUID
- `pgcrypto` : Cryptographie pour RLS

---

## 📈 MONITORING

### **Vérification santé base de données**
```sql
-- Connexions actives
SELECT count(*) FROM pg_stat_activity;

-- Taille base de données
SELECT pg_size_pretty(pg_database_size('wikipro_dev'));

-- Tables et tailles
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

### **Performance queries**
```sql
-- Requêtes lentes (> 1s)
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

---

## ✅ VALIDATION INSTALLATION

### **Tests de base**
```bash
# 1. Vérifier connexion
npm run typeorm -- query "SELECT version()"

# 2. Vérifier migrations
npm run db:status

# 3. Vérifier données
npm run typeorm -- query "SELECT * FROM tenants"

# 4. Test complet application
npm run start:dev
```

### **Checklist**
- [ ] PostgreSQL accessible sur port 5432
- [ ] pgAdmin accessible sur port 8080
- [ ] Migrations appliquées
- [ ] Tenant de développement présent
- [ ] Application démarre sans erreur

---

## 📞 SUPPORT

**En cas de problème :**
1. Vérifier les logs Docker: `npm run docker:logs`
2. Vérifier les variables env: `cat .env`
3. Reset complet: `npm run docker:reset && npm run db:setup`
4. Consulter la documentation TypeORM: https://typeorm.io

**Contact équipe :** Yves (CEO/Visionnaire)