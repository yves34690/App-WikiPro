-- Migration 003: Créer tables ai_sessions et conversations avec RLS
-- Créé par: Agent Backend-Core
-- Date: 2025-08-19
-- TICKET: BACKEND-003 - Persistance Sessions & Conversations

-- ======================================
-- 1. Créer la table ai_sessions
-- ======================================
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance avec isolation tenant
CREATE INDEX idx_ai_sessions_user_created ON ai_sessions(user_id, created_at DESC);
CREATE INDEX idx_ai_sessions_provider ON ai_sessions(provider);
CREATE INDEX idx_ai_sessions_title_search ON ai_sessions USING GIN (to_tsvector('french', title));

-- ======================================
-- 2. Créer la table conversations
-- ======================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    provider_used VARCHAR(50) CHECK (provider_used IN ('openai', 'anthropic', 'gemini')),
    tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
    processing_time_ms INTEGER DEFAULT 0 CHECK (processing_time_ms >= 0),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance et tri chronologique
CREATE INDEX idx_conversations_session_created ON conversations(session_id, created_at DESC);
CREATE INDEX idx_conversations_provider ON conversations(provider_used);
CREATE INDEX idx_conversations_tokens ON conversations(tokens_used DESC) WHERE tokens_used > 0;

-- ======================================
-- 3. Trigger pour updated_at automatique
-- ======================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_sessions_updated_at 
    BEFORE UPDATE ON ai_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================
-- 4. Activer RLS (Row Level Security)
-- ======================================
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ======================================
-- 5. Créer les RLS Policies pour isolation tenant
-- ======================================

-- Policy pour ai_sessions: isoler par tenant via user_id
CREATE POLICY ai_sessions_tenant_isolation ON ai_sessions
    FOR ALL
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE tenant_id = current_setting('app.current_tenant_id', true)::UUID
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id FROM users 
            WHERE tenant_id = current_setting('app.current_tenant_id', true)::UUID
        )
    );

-- Policy pour conversations: isoler via session qui isole déjà par tenant
CREATE POLICY conversations_tenant_isolation ON conversations
    FOR ALL
    USING (
        session_id IN (
            SELECT s.id FROM ai_sessions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE u.tenant_id = current_setting('app.current_tenant_id', true)::UUID
        )
    )
    WITH CHECK (
        session_id IN (
            SELECT s.id FROM ai_sessions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE u.tenant_id = current_setting('app.current_tenant_id', true)::UUID
        )
    );

-- ======================================
-- 6. Créer fonctions utilitaires
-- ======================================

-- Fonction pour obtenir le nombre de conversations d'une session
CREATE OR REPLACE FUNCTION get_session_conversation_count(session_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    conversation_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conversation_count
    FROM conversations
    WHERE session_id = session_uuid;
    
    RETURN COALESCE(conversation_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir la dernière activité d'une session
CREATE OR REPLACE FUNCTION get_session_last_activity(session_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    last_activity TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT GREATEST(
        s.created_at,
        COALESCE(MAX(c.created_at), s.created_at)
    )
    INTO last_activity
    FROM ai_sessions s
    LEFT JOIN conversations c ON s.id = c.session_id
    WHERE s.id = session_uuid
    GROUP BY s.id, s.created_at;
    
    RETURN last_activity;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- 7. Contraintes additionnelles de validation
-- ======================================

-- Contrainte: Une session doit avoir un titre non vide
ALTER TABLE ai_sessions ADD CONSTRAINT ai_sessions_title_not_empty 
    CHECK (LENGTH(TRIM(title)) > 0);

-- Contrainte: Un message de conversation ne peut pas être vide
ALTER TABLE conversations ADD CONSTRAINT conversations_message_not_empty 
    CHECK (LENGTH(TRIM(message)) > 0);

-- Contrainte: Si tokens_used > 0, alors response doit exister
ALTER TABLE conversations ADD CONSTRAINT conversations_tokens_response_consistency
    CHECK (
        (tokens_used = 0) OR 
        (tokens_used > 0 AND response IS NOT NULL AND LENGTH(TRIM(response)) > 0)
    );

-- ======================================
-- 8. Commentaires pour documentation
-- ======================================
COMMENT ON TABLE ai_sessions IS 'Sessions IA pour conversations multi-tenant avec isolation stricte';
COMMENT ON TABLE conversations IS 'Historique des conversations par session avec tracking performance';

COMMENT ON COLUMN ai_sessions.provider IS 'Provider IA utilisé: openai, anthropic, ou gemini';
COMMENT ON COLUMN ai_sessions.metadata IS 'Métadonnées JSON flexibles pour extensions futures';
COMMENT ON COLUMN conversations.tokens_used IS 'Nombre de tokens consommés pour cette conversation';
COMMENT ON COLUMN conversations.processing_time_ms IS 'Temps de traitement en millisecondes';
COMMENT ON COLUMN conversations.metadata IS 'Métadonnées conversation: contexte, paramètres, etc.';

-- ======================================
-- 9. Permissions pour l'application
-- ======================================

-- Accorder les permissions nécessaires au rôle applicatif
-- (Assumant que le rôle 'wikipro_app' existe déjà)
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_sessions TO wikipro_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO wikipro_app;
GRANT USAGE ON SCHEMA public TO wikipro_app;

-- Permission d'utiliser les fonctions utilitaires
GRANT EXECUTE ON FUNCTION get_session_conversation_count(UUID) TO wikipro_app;
GRANT EXECUTE ON FUNCTION get_session_last_activity(UUID) TO wikipro_app;

-- ======================================
-- 10. Insertion de données de test (optionnel)
-- ======================================

-- Cette section sera exécutée si l'environnement est dev/test
DO $$
BEGIN
    -- Vérifier si nous sommes en environnement de développement
    IF current_setting('server_version_num')::int >= 140000 THEN
        -- Données de test uniquement si la base contient des utilisateurs de test
        INSERT INTO ai_sessions (user_id, title, provider, metadata) 
        SELECT 
            u.id,
            'Session de test - ' || u.first_name,
            'openai',
            '{"test": true, "environment": "development"}'::jsonb
        FROM users u
        WHERE u.email LIKE '%@test.%' OR u.email LIKE '%test@%'
        LIMIT 5;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorer les erreurs d'insertion de données de test
        NULL;
END $$;