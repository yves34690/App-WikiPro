import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { AppModule } from '../../../app.module';
import { Session, AIProvider } from '../entities/session.entity';
import { Conversation } from '../entities/conversation.entity';
import { User, UserRole, UserStatus } from '@core/entities/user.entity';
import { Tenant } from '@core/entities/tenant.entity';

interface TestDataConfig {
  tenantsCount: number;
  usersPerTenant: number;
  sessionsPerUser: number;
  conversationsPerSession: number;
}

/**
 * Script pour créer des données de test volumineuses
 * Usage: npm run test-data:create
 */
async function createTestData(config: TestDataConfig = {
  tenantsCount: 3,
  usersPerTenant: 2,
  sessionsPerUser: 5,
  conversationsPerSession: 8,
}) {
  const logger = new Logger('CreateTestData');
  
  logger.log('🚀 Début création des données de test pour sessions IA');
  logger.log(`Configuration: ${JSON.stringify(config, null, 2)}`);

  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Obtenir les repositories
  const tenantRepository = app.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const sessionRepository = app.get<Repository<Session>>(getRepositoryToken(Session));
  const conversationRepository = app.get<Repository<Conversation>>(getRepositoryToken(Conversation));

  try {
    // 1. Nettoyer les données existantes
    logger.log('🧹 Nettoyage des données existantes...');
    await conversationRepository.delete({});
    await sessionRepository.delete({});
    await userRepository.delete({});
    await tenantRepository.delete({});

    // 2. Créer les tenants
    logger.log(`🏢 Création de ${config.tenantsCount} tenants...`);
    const tenants: Tenant[] = [];
    
    for (let i = 1; i <= config.tenantsCount; i++) {
      const tenant = tenantRepository.create({
        slug: `tenant-test-${i}`,
        name: `Tenant Test ${i}`,
        is_active: true,
        settings: {
          ai_providers: ['openai', 'anthropic', 'gemini'],
          max_sessions_per_user: 100,
          max_conversations_per_session: 1000,
        },
      });
      tenants.push(tenant);
    }
    
    const savedTenants = await tenantRepository.save(tenants);
    logger.log(`✅ ${savedTenants.length} tenants créés`);

    // 3. Créer les utilisateurs
    logger.log(`👥 Création de ${config.usersPerTenant} utilisateurs par tenant...`);
    const users: User[] = [];
    
    for (const tenant of savedTenants) {
      for (let u = 1; u <= config.usersPerTenant; u++) {
        const user = userRepository.create({
          tenant_id: tenant.id,
          email: `user${u}@${tenant.slug}.com`,
          name: `User ${u} - ${tenant.name}`,
          first_name: `User${u}`,
          last_name: tenant.name,
          password_hash: 'hashed_password_demo',
          role: u === 1 ? UserRole.ADMIN : UserRole.USER,
          status: UserStatus.ACTIVE,
          preferences: {
            ai_provider_preference: Object.values(AIProvider)[u % 3],
            theme: 'dark',
            language: 'fr',
          },
        });
        users.push(user);
      }
    }
    
    const savedUsers = await userRepository.save(users);
    logger.log(`✅ ${savedUsers.length} utilisateurs créés`);

    // 4. Créer les sessions IA
    logger.log(`🧠 Création de ${config.sessionsPerUser} sessions par utilisateur...`);
    const sessions: Session[] = [];
    const sessionTitles = [
      'Analyse stratégique Q1 2025',
      'Étude de marché concurrentiel',
      'Optimisation processus métier',
      'Roadmap produit IA',
      'Stratégie transformation digitale',
      'Audit performance système',
      'Plan marketing digital',
      'Architecture microservices',
      'Analyse des tendances secteur',
      'Projet innovation R&D',
    ];
    
    for (const user of savedUsers) {
      for (let s = 1; s <= config.sessionsPerUser; s++) {
        const providers = Object.values(AIProvider);
        const session = sessionRepository.create({
          user_id: user.id,
          title: sessionTitles[(s - 1) % sessionTitles.length] + ` #${s}`,
          provider: providers[s % providers.length],
          metadata: {
            created_by: user.id,
            tenant_id: user.tenant_id,
            priority: s <= 2 ? 'high' : s <= 4 ? 'medium' : 'low',
            category: ['analysis', 'strategy', 'optimization', 'innovation'][s % 4],
            tags: [`tag${s}`, 'test-data', `user-${user.id.slice(-4)}`],
            estimated_duration_minutes: Math.floor(Math.random() * 180) + 30,
          },
        });
        sessions.push(session);
      }
    }
    
    const savedSessions = await sessionRepository.save(sessions);
    logger.log(`✅ ${savedSessions.length} sessions créées`);

    // 5. Créer les conversations
    logger.log(`💬 Création de ${config.conversationsPerSession} conversations par session...`);
    const conversations: Conversation[] = [];
    
    const sampleMessages = [
      'Peux-tu analyser les tendances actuelles du marché ?',
      'Quelles sont les meilleures pratiques dans ce domaine ?',
      'Comment optimiser notre stratégie concurrentielle ?',
      'Propose-moi un plan d\'action détaillé',
      'Quels sont les risques à considérer ?',
      'Analyse comparative avec nos concurrents principaux',
      'Recommandations pour améliorer l\'efficacité',
      'Évaluation de l\'impact sur nos objectifs',
      'Suggestions d\'indicateurs de performance',
      'Synthèse des points clés à retenir',
    ];

    const sampleResponses = [
      'Basé sur l\'analyse des données disponibles, voici les tendances identifiées...',
      'Les meilleures pratiques dans ce secteur incluent...',
      'Pour optimiser votre stratégie concurrentielle, je recommande...',
      'Voici un plan d\'action structuré en 5 étapes...',
      'Les principaux risques à considérer sont...',
      'L\'analyse comparative révèle les points suivants...',
      'Mes recommandations pour améliorer l\'efficacité...',
      'L\'impact estimé sur vos objectifs sera...',
      'Voici les indicateurs de performance suggérés...',
      'En synthèse, les points clés à retenir sont...',
    ];

    for (const session of savedSessions) {
      for (let c = 1; c <= config.conversationsPerSession; c++) {
        const messageIndex = (c - 1) % sampleMessages.length;
        const hasResponse = Math.random() > 0.1; // 90% des conversations ont une réponse
        
        const conversation = conversationRepository.create({
          session_id: session.id,
          message: sampleMessages[messageIndex],
          response: hasResponse ? sampleResponses[messageIndex] : null,
          provider_used: hasResponse ? session.provider : null,
          tokens_used: hasResponse ? Math.floor(Math.random() * 2000) + 100 : 0,
          processing_time_ms: hasResponse ? Math.floor(Math.random() * 4000) + 500 : 0,
          metadata: {
            conversation_number: c,
            session_provider: session.provider,
            response_quality: hasResponse ? ['excellent', 'good', 'average'][Math.floor(Math.random() * 3)] : null,
            user_satisfaction: hasResponse ? Math.floor(Math.random() * 5) + 1 : null,
            context_length: Math.floor(Math.random() * 1000) + 500,
          },
        });
        
        // Ajouter un délai réaliste entre les conversations
        const baseTime = session.created_at.getTime();
        conversation.created_at = new Date(baseTime + (c * 5 * 60 * 1000)); // 5 min entre chaque
        
        conversations.push(conversation);
      }
    }
    
    const savedConversations = await conversationRepository.save(conversations);
    logger.log(`✅ ${savedConversations.length} conversations créées`);

    // 6. Statistiques finales
    const stats = {
      tenants: savedTenants.length,
      users: savedUsers.length,
      sessions: savedSessions.length,
      conversations: savedConversations.length,
      totalTokensUsed: savedConversations.reduce((sum, conv) => sum + (conv.tokens_used || 0), 0),
      avgProcessingTime: Math.round(
        savedConversations
          .filter(conv => conv.processing_time_ms > 0)
          .reduce((sum, conv) => sum + conv.processing_time_ms, 0) / 
        savedConversations.filter(conv => conv.processing_time_ms > 0).length
      ),
    };

    logger.log('📊 Statistiques des données créées:');
    logger.log(`   • ${stats.tenants} tenants`);
    logger.log(`   • ${stats.users} utilisateurs`);
    logger.log(`   • ${stats.sessions} sessions IA`);
    logger.log(`   • ${stats.conversations} conversations`);
    logger.log(`   • ${stats.totalTokensUsed.toLocaleString()} tokens utilisés au total`);
    logger.log(`   • ${stats.avgProcessingTime}ms de temps de traitement moyen`);

    // 7. Test rapide des performances
    logger.log('⚡ Test de performance...');
    const perfStartTime = Date.now();
    
    // Simuler une requête typique
    const testTenant = savedTenants[0];
    const testUser = savedUsers.find(u => u.tenant_id === testTenant.id);
    
    await sessionRepository.query(`SET app.current_tenant_id = '${testTenant.id}'`);
    
    const userSessions = await sessionRepository.find({
      where: { user_id: testUser.id },
      take: 20,
      order: { created_at: 'DESC' },
    });
    
    const perfDuration = Date.now() - perfStartTime;
    logger.log(`   • Récupération de ${userSessions.length} sessions en ${perfDuration}ms`);
    
    if (perfDuration < 200) {
      logger.log('✅ Performance objectif < 200ms atteinte !');
    } else {
      logger.warn(`⚠️  Performance ${perfDuration}ms > objectif 200ms`);
    }

    logger.log('🎉 Données de test créées avec succès !');
    
    return stats;

  } catch (error) {
    logger.error('❌ Erreur lors de la création des données de test:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Script pour nettoyer les données de test
 */
async function cleanTestData() {
  const logger = new Logger('CleanTestData');
  logger.log('🧹 Nettoyage des données de test...');

  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const tenantRepository = app.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const sessionRepository = app.get<Repository<Session>>(getRepositoryToken(Session));
    const conversationRepository = app.get<Repository<Conversation>>(getRepositoryToken(Conversation));

    // Nettoyer dans l'ordre inverse des dépendances
    await conversationRepository.delete({});
    await sessionRepository.delete({});
    await userRepository.delete({});
    await tenantRepository.delete({});

    logger.log('✅ Données de test nettoyées');
  } catch (error) {
    logger.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Script principal
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      const config = {
        tenantsCount: parseInt(process.argv[3]) || 3,
        usersPerTenant: parseInt(process.argv[4]) || 2,
        sessionsPerUser: parseInt(process.argv[5]) || 5,
        conversationsPerSession: parseInt(process.argv[6]) || 8,
      };
      await createTestData(config);
      break;
      
    case 'clean':
      await cleanTestData();
      break;
      
    case 'create-large':
      await createTestData({
        tenantsCount: 5,
        usersPerTenant: 10,
        sessionsPerUser: 20,
        conversationsPerSession: 15,
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run test-data create [tenants] [users] [sessions] [conversations]');
      console.log('  npm run test-data clean');
      console.log('  npm run test-data create-large');
      console.log('');
      console.log('Exemples:');
      console.log('  npm run test-data create');
      console.log('  npm run test-data create 3 2 5 8');
      console.log('  npm run test-data create-large');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { createTestData, cleanTestData };