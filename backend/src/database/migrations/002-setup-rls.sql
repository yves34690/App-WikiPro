-- Migration 002: Configuration Row Level Security (RLS) pour isolation multi-tenant
-- Créé le: ${new Date().toISOString()}

-- ACTIVATION RLS SUR LES TABLES
-- ================================

-- Activer RLS sur la table users (isolation critique)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table tenants (protection administrative)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- POLITIQUES RLS POUR LA TABLE USERS
-- ===================================

-- Politique: Les utilisateurs ne peuvent voir que les données de leur tenant
CREATE POLICY users_tenant_isolation ON users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Politique: Les super-admins peuvent voir tous les utilisateurs (bypass)
CREATE POLICY users_superadmin_access ON users
    FOR ALL
    TO authenticated
    USING (current_setting('app.current_user_role', true) = 'super-admin')
    WITH CHECK (current_setting('app.current_user_role', true) = 'super-admin');

-- POLITIQUES RLS POUR LA TABLE TENANTS
-- ====================================

-- Politique: Les utilisateurs ne peuvent voir que leur tenant
CREATE POLICY tenants_own_access ON tenants
    FOR SELECT
    USING (id = current_setting('app.current_tenant_id', true)::uuid);

-- Politique: Les super-admins peuvent voir tous les tenants
CREATE POLICY tenants_superadmin_access ON tenants
    FOR ALL
    TO authenticated
    USING (current_setting('app.current_user_role', true) = 'super-admin')
    WITH CHECK (current_setting('app.current_user_role', true) = 'super-admin');

-- Politique: Les admins de tenant peuvent modifier leur tenant
CREATE POLICY tenants_admin_update ON tenants
    FOR UPDATE
    USING (
        id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        id = current_setting('app.current_tenant_id', true)::uuid 
        AND current_setting('app.current_user_role', true) = 'admin'
    );

-- FONCTIONS UTILITAIRES POUR RLS
-- ===============================

-- Fonction pour définir le contexte de tenant dans une session
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id uuid, p_user_id uuid, p_user_role text)
RETURNS void AS $$
BEGIN
    -- Validation des paramètres
    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'tenant_id ne peut pas être NULL';
    END IF;
    
    IF p_user_role IS NULL THEN
        RAISE EXCEPTION 'user_role ne peut pas être NULL';
    END IF;
    
    -- Définir les paramètres de session pour RLS
    PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
    PERFORM set_config('app.current_user_id', p_user_id::text, true);
    PERFORM set_config('app.current_user_role', p_user_role, true);
    
    -- Log de sécurité
    RAISE LOG 'Contexte tenant défini: tenant_id=%, user_id=%, role=%', 
        p_tenant_id, p_user_id, p_user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer le contexte de session
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', NULL, true);
    PERFORM set_config('app.current_user_id', NULL, true);
    PERFORM set_config('app.current_user_role', NULL, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'isolation tenant
CREATE OR REPLACE FUNCTION verify_tenant_isolation(p_tenant_id uuid)
RETURNS boolean AS $$
DECLARE
    current_tenant_id uuid;
BEGIN
    -- Récupérer le tenant actuel de la session
    current_tenant_id := current_setting('app.current_tenant_id', true)::uuid;
    
    -- Vérifier l'isolation
    IF current_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Contexte tenant non défini';
    END IF;
    
    IF current_tenant_id != p_tenant_id THEN
        RAISE EXCEPTION 'Violation isolation tenant: session=%, demandé=%', 
            current_tenant_id, p_tenant_id;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RÔLES ET PERMISSIONS
-- ====================

-- Créer un rôle pour les applications (sera utilisé par NestJS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wikipro_app') THEN
        CREATE ROLE wikipro_app WITH LOGIN PASSWORD 'change_me_in_production';
    END IF;
END
$$;

-- Permissions sur les tables
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO wikipro_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO wikipro_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wikipro_app;

-- Permissions sur les fonctions RLS
GRANT EXECUTE ON FUNCTION set_tenant_context(uuid, uuid, text) TO wikipro_app;
GRANT EXECUTE ON FUNCTION clear_tenant_context() TO wikipro_app;
GRANT EXECUTE ON FUNCTION verify_tenant_isolation(uuid) TO wikipro_app;

-- INDEX POUR OPTIMISER RLS
-- ========================

-- Index partiel pour les requêtes avec filtre tenant
CREATE INDEX IF NOT EXISTS idx_users_tenant_rls ON users(tenant_id) 
WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid;

-- VUES POUR FACILITER LES REQUÊTES
-- =================================

-- Vue pour les statistiques tenant (respecte automatiquement RLS)
CREATE OR REPLACE VIEW tenant_stats AS
SELECT 
    t.id,
    t.name,
    t.slug,
    t.plan_type,
    t.is_active,
    COUNT(u.id) as user_count,
    COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_user_count,
    t.created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
GROUP BY t.id, t.name, t.slug, t.plan_type, t.is_active, t.created_at;

-- Permissions sur la vue
GRANT SELECT ON tenant_stats TO wikipro_app;

-- TESTS RLS (à exécuter manuellement pour validation)
-- ===================================================

-- Ces commandes peuvent être utilisées pour tester le RLS
/*
-- Test 1: Définir un contexte tenant
SELECT set_tenant_context(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    (SELECT id FROM users WHERE email = 'admin@demo-company.com'),
    'admin'
);

-- Test 2: Vérifier que seuls les utilisateurs du tenant sont visibles
SELECT email, tenant_id FROM users;

-- Test 3: Tenter d'accéder aux données d'un autre tenant (doit échouer)
SELECT verify_tenant_isolation('00000000-0000-0000-0000-000000000000'::uuid);

-- Test 4: Nettoyer le contexte
SELECT clear_tenant_context();
*/

-- COMMENTAIRES DE DOCUMENTATION
-- =============================

COMMENT ON POLICY users_tenant_isolation ON users IS 
'Isolation stricte: utilisateurs ne voient que les données de leur tenant';

COMMENT ON POLICY users_superadmin_access ON users IS 
'Bypass pour super-admins: accès à tous les utilisateurs';

COMMENT ON FUNCTION set_tenant_context(uuid, uuid, text) IS 
'Définit le contexte tenant pour la session courante - CRITIQUE POUR SÉCURITÉ';

COMMENT ON FUNCTION verify_tenant_isolation(uuid) IS 
'Vérifie l\'isolation tenant - Lève une exception si violation';

-- Log de fin de migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 002 terminée: RLS configuré avec succès';
    RAISE NOTICE 'Isolation multi-tenant ACTIVE sur toutes les tables';
    RAISE NOTICE 'Utilisez set_tenant_context() avant chaque requête métier';
END
$$;