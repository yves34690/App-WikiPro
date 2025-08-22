import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConversationAndMessageTables1755781800000 implements MigrationInterface {
    name = 'CreateConversationAndMessageTables1755781800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer les types ENUM nécessaires
        await queryRunner.query(`
            CREATE TYPE "message_role" AS ENUM ('user', 'assistant', 'system', 'function')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "message_status" AS ENUM ('pending', 'processing', 'completed', 'error', 'cancelled')
        `);

        // Créer la table conversations
        await queryRunner.query(`
            CREATE TABLE "conversations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255),
                "description" text,
                "tenant_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "context_type" character varying(100) NOT NULL DEFAULT 'general',
                "ai_settings" jsonb NOT NULL DEFAULT '{}',
                "attached_documents" jsonb NOT NULL DEFAULT '[]',
                "metadata" jsonb NOT NULL DEFAULT '{}',
                "is_active" boolean NOT NULL DEFAULT true,
                "is_archived" boolean NOT NULL DEFAULT false,
                "is_pinned" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "last_message_at" TIMESTAMP,
                "created_by" uuid,
                "updated_by" uuid,
                "message_count" integer NOT NULL DEFAULT 0,
                "token_count" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
            )
        `);

        // Créer la table messages
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tenant_id" uuid NOT NULL,
                "conversation_id" uuid NOT NULL,
                "user_id" uuid,
                "role" message_role NOT NULL,
                "content" text NOT NULL,
                "content_raw" text,
                "ai_provider" character varying(100),
                "ai_model" character varying(100),
                "ai_parameters" jsonb NOT NULL DEFAULT '{}',
                "token_count" integer,
                "prompt_tokens" integer,
                "completion_tokens" integer,
                "status" message_status NOT NULL DEFAULT 'completed',
                "error_message" text,
                "error_details" jsonb,
                "attachments" jsonb NOT NULL DEFAULT '[]',
                "context_data" jsonb NOT NULL DEFAULT '{}',
                "citations" jsonb NOT NULL DEFAULT '[]',
                "metadata" jsonb NOT NULL DEFAULT '{}',
                "is_visible" boolean NOT NULL DEFAULT true,
                "is_edited" boolean NOT NULL DEFAULT false,
                "is_flagged" boolean NOT NULL DEFAULT false,
                "response_time_ms" integer,
                "confidence" real,
                "rating" integer,
                "feedback" text,
                "parent_message_id" uuid,
                "sequence_number" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP,
                "created_by" uuid,
                "updated_by" uuid,
                CONSTRAINT "PK_messages" PRIMARY KEY ("id")
            )
        `);

        // Créer les index pour conversations
        await queryRunner.query(`CREATE INDEX "IDX_conversations_tenant_user" ON "conversations" ("tenant_id", "user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_conversations_tenant_created" ON "conversations" ("tenant_id", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_conversations_active" ON "conversations" ("is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_conversations_last_message" ON "conversations" ("last_message_at")`);

        // Créer les index pour messages  
        await queryRunner.query(`CREATE INDEX "IDX_messages_tenant_conversation_created" ON "messages" ("tenant_id", "conversation_id", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_conversation_role" ON "messages" ("conversation_id", "role")`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_status" ON "messages" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_sequence" ON "messages" ("conversation_id", "sequence_number")`);

        // Créer les clés étrangères
        await queryRunner.query(`
            ALTER TABLE "conversations" 
            ADD CONSTRAINT "FK_conversations_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD CONSTRAINT "FK_messages_conversation" 
            FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD CONSTRAINT "FK_messages_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" 
            ADD CONSTRAINT "FK_messages_parent" 
            FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les clés étrangères
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_parent"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_user"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_user"`);

        // Supprimer les index
        await queryRunner.query(`DROP INDEX "IDX_messages_sequence"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_status"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_conversation_role"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_tenant_conversation_created"`);
        await queryRunner.query(`DROP INDEX "IDX_conversations_last_message"`);
        await queryRunner.query(`DROP INDEX "IDX_conversations_active"`);
        await queryRunner.query(`DROP INDEX "IDX_conversations_tenant_created"`);
        await queryRunner.query(`DROP INDEX "IDX_conversations_tenant_user"`);

        // Supprimer les tables
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "conversations"`);

        // Supprimer les types ENUM
        await queryRunner.query(`DROP TYPE "message_status"`);
        await queryRunner.query(`DROP TYPE "message_role"`);
    }
}