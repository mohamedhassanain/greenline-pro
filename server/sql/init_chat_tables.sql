-- Table des conversations de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des messages du chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour mettre à jour automatiquement le champ updated_at
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE chat_conversations IS 'Stocke les conversations de chat des utilisateurs';
COMMENT ON COLUMN chat_conversations.is_active IS 'Indique si la conversation est active (non supprimée)';

COMMENT ON TABLE chat_messages IS 'Stocke les messages des conversations de chat';
COMMENT ON COLUMN chat_messages.role IS 'Rôle de l''expéditeur du message (user, assistant, system)';
COMMENT ON COLUMN chat_messages.content IS 'Contenu du message au format texte';

-- Droits d'accès
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE chat_conversations TO api_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE chat_messages TO api_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO api_user;
