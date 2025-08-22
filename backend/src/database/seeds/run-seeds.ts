import { AppDataSource } from '../data-source';
import { seedUsers } from './001-seed-users';
import { seedConversations } from './002-seed-conversations';

/**
 * Script principal pour exécuter les seeds de développement
 * Usage: npm run db:seed
 */
async function runSeeds() {
  console.log('🌱 Démarrage du seeding de la base de données...');
  
  try {
    // Initialiser la connexion
    const dataSource = await AppDataSource.initialize();
    console.log('✅ Connexion base de données établie');

    // Exécuter les seeds dans l'ordre
    console.log('📝 Insertion des données de seed...');
    
    // 1. Seed des utilisateurs (remplace les mocks AuthService)
    await seedUsers(dataSource);
    
    // 2. Seed des conversations et messages
    await seedConversations(dataSource);
    
    // TODO: Ajouter ici les futures seeds
    // await seedDocuments(dataSource);
    
    console.log('✅ Seeding terminé avec succès !');
    console.log('');
    console.log('📊 Données disponibles:');
    console.log('  - Tenant par défaut: dev (id: f47ac10b-58cc-4372-a567-0e02b2c3d479)');
    console.log('  - Configuration système de base');
    console.log('  - 3 utilisateurs de développement (testuser, admin, demo)');
    console.log('');
    console.log('🔐 Comptes de test:');
    console.log('  - testuser / testpassword (rôle: user)');
    console.log('  - admin / adminpassword (rôle: admin)');
    console.log('  - demo / demopassword (rôle: user, non vérifié)');
    console.log('');
    console.log('🔍 Vérifiez via pgAdmin: http://localhost:8080');
    console.log('  Email: admin@wikipro.dev');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 Connexion base de données fermée');
    }
  }
}

// Exécuter le seeding si ce fichier est lancé directement
if (require.main === module) {
  runSeeds();
}

export { runSeeds };