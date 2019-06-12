import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSubscriptionsTable1560322139588 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "subscriptions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "endpoint" character varying NOT NULL, "public_key" character varying NOT NULL, "authentication_secret" character varying NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "user_id" integer, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`
        )
        await queryRunner.query(
            `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`)
        await queryRunner.query(`DROP TABLE "subscriptions"`)
    }
}
