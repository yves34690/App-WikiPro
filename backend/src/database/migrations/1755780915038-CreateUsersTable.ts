import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1755780915038 implements MigrationInterface {
    name = 'CreateUsersTable1755780915038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "first_name" character varying(100), "last_name" character varying(100), "tenant_id" uuid NOT NULL, "roles" text NOT NULL DEFAULT 'user', "permissions" jsonb NOT NULL DEFAULT '{}', "preferences" jsonb NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, "is_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP, "last_login_at" TIMESTAMP, "last_login_ip" character varying(45), "failed_login_attempts" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP, "email_verification_token" character varying(255), "password_reset_token" character varying(255), "password_reset_expires" TIMESTAMP, "token_version" integer NOT NULL DEFAULT '1', "metadata" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, "updated_by" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40ec4dea118345e4d95fb836ad" ON "users" ("last_login_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_20c7aea6112bef71528210f631" ON "users" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_52a29f8fc340e73d124af517f2" ON "users" ("tenant_id", "username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e9f4c2efab52114c4e99e28efb" ON "users" ("tenant_id", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e9f4c2efab52114c4e99e28efb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52a29f8fc340e73d124af517f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20c7aea6112bef71528210f631"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40ec4dea118345e4d95fb836ad"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
