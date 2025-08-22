import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

/**
 * Seed des utilisateurs de développement
 * Remplace les users mockés dans AuthService
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding users...');

  const userRepository = dataSource.getRepository(User);

  // Tenant par défaut (créé dans InitialSetup)
  const defaultTenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  // Vérifier si les users existent déjà
  const existingUsers = await userRepository.find({
    where: { tenant_id: defaultTenantId }
  });

  if (existingUsers.length > 0) {
    console.log('✅ Users déjà présents, seeding ignoré');
    return;
  }

  // Utilisateurs de développement (équivalents aux mocks)
  const usersToSeed = [
    {
      username: 'testuser',
      email: 'test@wikipro.com',
      password_hash: 'testpassword', // Sera hashé automatiquement
      first_name: 'Test',
      last_name: 'User',
      tenant_id: defaultTenantId,
      roles: ['user'],
      is_active: true,
      is_verified: true,
      metadata: {
        source: 'seed',
        environment: 'development'
      }
    },
    {
      username: 'admin',
      email: 'admin@wikipro.com',
      password_hash: 'adminpassword', // Sera hashé automatiquement
      first_name: 'Admin',
      last_name: 'WikiPro',
      tenant_id: defaultTenantId,
      roles: ['admin', 'user'],
      is_active: true,
      is_verified: true,
      metadata: {
        source: 'seed',
        environment: 'development',
        permissions: ['all']
      }
    },
    {
      username: 'demo',
      email: 'demo@wikipro.com',
      password_hash: 'demopassword', // Sera hashé automatiquement
      first_name: 'Demo',
      last_name: 'User',
      tenant_id: defaultTenantId,
      roles: ['user'],
      is_active: true,
      is_verified: false, // Pour tester la vérification email
      metadata: {
        source: 'seed',
        environment: 'development',
        demo: true
      }
    }
  ];

  // Insérer les utilisateurs
  for (const userData of usersToSeed) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
    
    console.log(`✅ User créé: ${user.username} (${user.email})`);
  }

  console.log(`✅ ${usersToSeed.length} users seedés avec succès`);
}