import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiMetadataEnhancements1755790631167 implements MigrationInterface {
    name = 'AddAiMetadataEnhancements1755790631167';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Messages - Ajouter les champs IA manquants
        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD COLUMN "cost_usd" DECIMAL(10,6) DEFAULT 0.000000
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD COLUMN "confidence_score" DECIMAL(3,2)
        `);

        // Conversations - Ajouter les analytics globales IA
        await queryRunner.query(`
            ALTER TABLE "conversations" 
            ADD COLUMN "total_cost_usd" DECIMAL(10,4) DEFAULT 0.0000
        `);

        await queryRunner.query(`
            ALTER TABLE "conversations" 
            ADD COLUMN "total_tokens" INTEGER DEFAULT 0
        `);

        await queryRunner.query(`
            ALTER TABLE "conversations" 
            ADD COLUMN "avg_response_time_ms" INTEGER
        `);

        // Migrer les données existantes de token_count vers total_tokens
        await queryRunner.query(`
            UPDATE "conversations" 
            SET "total_tokens" = "token_count" 
            WHERE "token_count" > 0
        `);

        // Créer des index pour optimiser les requêtes analytics
        await queryRunner.query(`
            CREATE INDEX "IDX_messages_cost_analytics" 
            ON "messages" ("tenant_id", "ai_provider", "created_at", "cost_usd") 
            WHERE "cost_usd" IS NOT NULL
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_messages_ai_performance" 
            ON "messages" ("ai_model", "response_time_ms", "confidence_score") 
            WHERE "response_time_ms" IS NOT NULL
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_conversations_cost_analytics" 
            ON "conversations" ("tenant_id", "total_cost_usd", "created_at") 
            WHERE "total_cost_usd" > 0
        `);

        // Index composite pour analytics de performance par provider
        await queryRunner.query(`
            CREATE INDEX "IDX_messages_provider_analytics" 
            ON "messages" ("tenant_id", "ai_provider", "ai_model", "created_at") 
            WHERE "ai_provider" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_provider_analytics"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_cost_analytics"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_ai_performance"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_cost_analytics"`);

        // Supprimer les colonnes ajoutées aux conversations
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "avg_response_time_ms"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "total_tokens"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "total_cost_usd"`);

        // Supprimer les colonnes ajoutées aux messages
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "confidence_score"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "cost_usd"`);
    }
}