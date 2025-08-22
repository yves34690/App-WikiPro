import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

/**
 * Configuration TypeORM pour les migrations et CLI
 * Cette configuration est utilisée par les commandes TypeORM CLI
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'wikipro_user',
  password: process.env.DATABASE_PASSWORD || 'wikipro_password',
  database: process.env.DATABASE_NAME || 'wikipro_dev',
  
  // Chemin des entités
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Configuration des migrations
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  
  // Configuration développement
  synchronize: false, // Toujours false pour les migrations
  logging: process.env.NODE_ENV === 'development',
  
  // Configuration SSL pour production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Configuration multi-tenant
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

/**
 * Initialisation de la connexion base de données
 */
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Base de données connectée avec succès');
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

/**
 * Fermeture propre de la connexion
 */
export async function closeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Connexion base de données fermée');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    throw error;
  }
}