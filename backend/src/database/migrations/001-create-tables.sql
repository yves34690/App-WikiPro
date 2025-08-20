-- Migration 001: Création des tables de base pour WikiPro
-- Créé le: ${new Date().toISOString()}

-- Extension UUID si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des tenants (entités organisationnelles)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    settings JSONB,
    plan_type VARCHAR(50) DEFAULT 'trial' NOT NULL,
    plan_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index sur le slug pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenants_plan_type ON tenants(plan_type);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    avatar_url VARCHAR(255),
    preferences JSONB,
    last_login_at TIMESTAMP,
    last_login_ip INET,
    email_verified_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- Contrainte unique sur tenant_id + email
    CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email)
);

-- Index pour optimiser les requêtes multi-tenant
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Contraintes de validation
ALTER TABLE tenants ADD CONSTRAINT check_plan_type 
    CHECK (plan_type IN ('trial', 'basic', 'premium', 'enterprise'));

ALTER TABLE users ADD CONSTRAINT check_role 
    CHECK (role IN ('super-admin', 'admin', 'user', 'viewer'));

ALTER TABLE users ADD CONSTRAINT check_status 
    CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires de documentation
COMMENT ON TABLE tenants IS 'Table des tenants - Une entité = Un WikiPro';
COMMENT ON TABLE users IS 'Table des utilisateurs - Isolation stricte par tenant';
COMMENT ON COLUMN tenants.slug IS 'Identifiant unique URL-friendly du tenant';
COMMENT ON COLUMN users.tenant_id IS 'Clé étrangère vers le tenant - ISOLATION CRITIQUE';
COMMENT ON CONSTRAINT unique_tenant_email ON users IS 'Un email par tenant seulement';

-- Données de test (optionnel - seulement pour le développement)
DO $$
BEGIN
    -- Créer un tenant de test seulement s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'demo-company') THEN
        INSERT INTO tenants (id, name, slug, description, plan_type) VALUES 
        ('550e8400-e29b-41d4-a716-446655440000', 'Demo Company', 'demo-company', 'Tenant de démonstration pour WikiPro', 'trial');
        
        -- Utilisateur admin de test
        INSERT INTO users (tenant_id, email, password_hash, name, role, status, password_changed_at) VALUES 
        ('550e8400-e29b-41d4-a716-446655440000', 'admin@demo-company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZZbXa9g8RqrE2K', 'Admin Demo', 'admin', 'active', NOW());
        
        -- Utilisateur normal de test  
        INSERT INTO users (tenant_id, email, password_hash, name, role, status, password_changed_at) VALUES 
        ('550e8400-e29b-41d4-a716-446655440000', 'user@demo-company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewZZbXa9g8RqrE2K', 'User Demo', 'user', 'active', NOW());
    END IF;
END
$$;