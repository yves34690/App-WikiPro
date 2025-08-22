import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration initiale - Configuration de base WikiPro
 * 
 * Cette migration créée la structure de base nécessaire pour:
 * - Multi-tenant support avec Row Level Security
 * - Tables de configuration système
 * - Index optimisés pour les requêtes tenant
 */
export class InitialSetup1692000000000 implements MigrationInterface {
  name = 'InitialSetup1692000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==============================================
    // 1. EXTENSIONS POSTGRESQL REQUISES
    // ==============================================
    
    // UUID pour les clés primaires
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Row Level Security (multi-tenant)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // ==============================================
    // 2. TABLE DES TENANTS (ORGANISATIONS)
    // ==============================================
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'domain',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_TENANTS_SLUG',
            columnNames: ['slug'],
          },
          {
            name: 'IDX_TENANTS_DOMAIN',
            columnNames: ['domain'],
          },
          {
            name: 'IDX_TENANTS_ACTIVE',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );

    // ==============================================
    // 3. CONFIGURATION SYSTÈME
    // ==============================================
    await queryRunner.createTable(
      new Table({
        name: 'system_config',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_encrypted',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_SYSTEM_CONFIG_KEY',
            columnNames: ['key'],
          },
        ],
      }),
      true,
    );

    // ==============================================
    // 4. DONNÉES INITIALES
    // ==============================================
    
    // Tenant par défaut pour le développement
    await queryRunner.query(`
      INSERT INTO tenants (id, name, slug, domain, settings, is_active)
      VALUES (
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'WikiPro Development',
        'dev',
        'localhost',
        '{"theme": "light", "language": "fr", "timezone": "Europe/Paris"}',
        true
      )
    `);

    // Configuration système de base
    await queryRunner.query(`
      INSERT INTO system_config (key, value, description, is_encrypted)
      VALUES 
        ('app_version', '1.0.0', 'Version de l''application WikiPro', false),
        ('maintenance_mode', 'false', 'Mode maintenance globale', false),
        ('max_users_per_tenant', '100', 'Nombre maximum d''utilisateurs par tenant', false),
        ('default_user_role', 'user', 'Rôle par défaut des nouveaux utilisateurs', false)
    `);

    // ==============================================
    // 5. TRIGGERS DE MISE À JOUR AUTOMATIQUE
    // ==============================================
    
    // Fonction pour mise à jour automatique du champ updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Appliquer le trigger sur les tables avec updated_at
    await queryRunner.query(`
      CREATE TRIGGER trigger_tenants_updated_at
        BEFORE UPDATE ON tenants
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_system_config_updated_at
        BEFORE UPDATE ON system_config
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Migration InitialSetup appliquée avec succès');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_tenants_updated_at ON tenants`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_system_config_updated_at ON system_config`);
    
    // Supprimer la fonction
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    
    // Supprimer les tables (ordre inverse)
    await queryRunner.dropTable('system_config', true);
    await queryRunner.dropTable('tenants', true);
    
    // Supprimer les extensions (optionnel en développement)
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    
    console.log('✅ Migration InitialSetup annulée avec succès');
  }
}