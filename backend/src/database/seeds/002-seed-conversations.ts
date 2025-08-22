import { DataSource } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message, MessageRole } from '../entities/message.entity';
import { User } from '../entities/user.entity';

/**
 * Seed des conversations et messages de test
 * Crée des conversations de démo avec historique de chat
 */
export async function seedConversations(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding conversations...');

  const conversationRepository = dataSource.getRepository(Conversation);
  const messageRepository = dataSource.getRepository(Message);
  const userRepository = dataSource.getRepository(User);

  // Tenant par défaut
  const defaultTenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  // Récupérer les utilisateurs existants
  const users = await userRepository.find({
    where: { tenant_id: defaultTenantId }
  });

  if (users.length === 0) {
    console.log('⚠️  Aucun utilisateur trouvé, skip seeding conversations');
    return;
  }

  // Vérifier si des conversations existent déjà
  const existingConversations = await conversationRepository.find({
    where: { tenant_id: defaultTenantId }
  });

  if (existingConversations.length > 0) {
    console.log('✅ Conversations déjà présentes, seeding ignoré');
    return;
  }

  const testUser = users.find(u => u.username === 'testuser');
  const adminUser = users.find(u => u.username === 'admin');

  if (!testUser || !adminUser) {
    console.log('⚠️  Utilisateurs testuser/admin non trouvés');
    return;
  }

  // Conversation 1: Aide générale
  const conversation1 = conversationRepository.create({
    title: 'Comment utiliser WikiPro ?',
    description: 'Première conversation pour découvrir les fonctionnalités',
    tenant_id: defaultTenantId,
    user_id: testUser.id,
    context_type: 'general',
    ai_settings: {
      temperature: 0.7,
      max_tokens: 1000,
      model: 'gpt-4'
    },
    metadata: {
      source: 'seed',
      environment: 'development'
    }
  });

  await conversationRepository.save(conversation1);

  // Messages pour conversation 1
  const messages1 = [
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation1.id,
      user_id: testUser.id,
      role: MessageRole.USER,
      content: 'Bonjour ! Comment puis-je utiliser WikiPro pour gérer ma base de connaissances ?',
      sequence_number: 1,
      metadata: { source: 'seed' }
    },
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation1.id,
      user_id: null,
      role: MessageRole.ASSISTANT,
      content: 'Bonjour ! WikiPro est votre assistant IA pour la gestion de connaissances organisationnelles. Voici les principales fonctionnalités :\n\n1. **Chat Intelligent** : Posez vos questions, je vous aide à analyser vos documents\n2. **Gestion Documentaire** : Importez et organisez vos fichiers\n3. **Analyses IA** : Génération de synthèses, rapports et recommandations\n4. **Multi-tenant** : Chaque organisation a son espace sécurisé\n\nVoulez-vous que je vous guide pour commencer ?',
      ai_provider: 'openai',
      ai_model: 'gpt-4',
      ai_parameters: { temperature: 0.7, max_tokens: 1000 },
      token_count: 95,
      prompt_tokens: 45,
      completion_tokens: 50,
      response_time_ms: 1200,
      sequence_number: 2,
      metadata: { source: 'seed' }
    },
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation1.id,
      user_id: testUser.id,
      role: MessageRole.USER,
      content: 'Oui, j\'aimerais savoir comment importer mes premiers documents.',
      sequence_number: 3,
      metadata: { source: 'seed' }
    },
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation1.id,
      user_id: null,
      role: MessageRole.ASSISTANT,
      content: 'Parfait ! Pour importer vos documents dans WikiPro :\n\n📁 **Import de documents** :\n- Formats supportés : PDF, Word, Excel, PowerPoint, Markdown\n- Glissez-déposez vos fichiers ou utilisez le bouton "Import"\n- L\'IA analyse automatiquement le contenu\n\n🏷️ **Organisation** :\n- Créez des catégories par projet ou département\n- Ajoutez des tags pour faciliter la recherche\n- L\'IA suggère des classifications automatiques\n\n🔍 **Recherche intelligente** :\n- Recherche par mots-clés, concepts ou questions\n- L\'IA comprend le contexte et les synonymes\n\nVoulez-vous que je vous montre un exemple concret ?',
      ai_provider: 'openai',
      ai_model: 'gpt-4',
      ai_parameters: { temperature: 0.7, max_tokens: 1000 },
      token_count: 120,
      prompt_tokens: 70,
      completion_tokens: 50,
      response_time_ms: 1500,
      sequence_number: 4,
      metadata: { source: 'seed' }
    }
  ];

  for (const msgData of messages1) {
    const message = messageRepository.create(msgData);
    await messageRepository.save(message);
  }

  // Mettre à jour le compteur de messages de la conversation
  conversation1.message_count = messages1.length;
  conversation1.last_message_at = new Date();
  await conversationRepository.save(conversation1);

  // Conversation 2: Analyse technique (Admin)
  const conversation2 = conversationRepository.create({
    title: 'Analyse technique - Architecture WikiPro',
    description: 'Discussion technique sur l\'architecture du système',
    tenant_id: defaultTenantId,
    user_id: adminUser.id,
    context_type: 'code_review',
    ai_settings: {
      temperature: 0.3,
      max_tokens: 2000,
      model: 'gpt-4'
    },
    metadata: {
      source: 'seed',
      environment: 'development',
      priority: 'high'
    },
    is_pinned: true
  });

  await conversationRepository.save(conversation2);

  // Messages pour conversation 2
  const messages2 = [
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation2.id,
      user_id: adminUser.id,
      role: MessageRole.USER,
      content: 'Peux-tu analyser l\'architecture actuelle de WikiPro et me donner tes recommandations pour l\'optimisation ?',
      sequence_number: 1,
      metadata: { source: 'seed' }
    },
    {
      tenant_id: defaultTenantId,
      conversation_id: conversation2.id,
      user_id: null,
      role: MessageRole.ASSISTANT,
      content: 'Excellente question ! Basé sur l\'architecture WikiPro actuelle, voici mon analyse :\n\n🏗️ **Architecture Actuelle** :\n- **Backend** : NestJS + TypeORM + PostgreSQL\n- **Frontend** : React (Create React App)\n- **IA** : Multi-providers (OpenAI, Anthropic, Gemini)\n- **Base données** : PostgreSQL avec Row Level Security\n- **Infrastructure** : Docker Compose (dev)\n\n✅ **Points forts** :\n- Multi-tenant natif avec isolation par tenant_id\n- Architecture modulaire NestJS bien structurée\n- Support multi-providers IA (résilience)\n- TypeORM pour la gestion de schéma\n\n📈 **Recommandations d\'optimisation** :\n1. **Performance** : Ajouter Redis pour cache et sessions\n2. **Sécurité** : Implémenter rate limiting et audit logs\n3. **Scalabilité** : Migration vers microservices pour production\n4. **Monitoring** : Metrics OpenTelemetry + Prometheus\n5. **CI/CD** : Pipeline automatisé avec tests e2e\n\nVeux-tu que je détaille un aspect particulier ?',
      ai_provider: 'openai',
      ai_model: 'gpt-4',
      ai_parameters: { temperature: 0.3, max_tokens: 2000 },
      token_count: 185,
      prompt_tokens: 85,
      completion_tokens: 100,
      response_time_ms: 2300,
      sequence_number: 2,
      metadata: { source: 'seed', analysis_type: 'architecture' }
    }
  ];

  for (const msgData of messages2) {
    const message = messageRepository.create(msgData);
    await messageRepository.save(message);
  }

  // Mettre à jour le compteur de messages
  conversation2.message_count = messages2.length;
  conversation2.last_message_at = new Date();
  await conversationRepository.save(conversation2);

  // Conversation 3: Conversation archivée
  const conversation3 = conversationRepository.create({
    title: 'Test initial - à archiver',
    description: 'Conversation de test qui sera archivée',
    tenant_id: defaultTenantId,
    user_id: testUser.id,
    context_type: 'general',
    is_active: false,
    is_archived: true,
    metadata: {
      source: 'seed',
      archived_reason: 'test_completed'
    }
  });

  await conversationRepository.save(conversation3);

  // Un seul message pour la conversation archivée
  const message3 = messageRepository.create({
    tenant_id: defaultTenantId,
    conversation_id: conversation3.id,
    user_id: testUser.id,
    role: MessageRole.USER,
    content: 'Ceci est un test de conversation qui sera archivée.',
    sequence_number: 1,
    metadata: { source: 'seed' }
  });

  await messageRepository.save(message3);
  
  conversation3.message_count = 1;
  conversation3.last_message_at = new Date();
  await conversationRepository.save(conversation3);

  console.log(`✅ ${3} conversations seedées avec succès`);
  console.log(`✅ ${messages1.length + messages2.length + 1} messages seedés`);
}