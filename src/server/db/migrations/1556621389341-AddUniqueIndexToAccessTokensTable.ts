import { MigrationInterface, QueryRunner, TableIndex } from "typeorm"

export class AddUniqueIndexToAccessTokensTable1556621389341
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createIndices("access_tokens", [
            new TableIndex({
                name:
                    "UQ:access_tokens:application_id:user_id::only_not_revoked",
                columnNames: ["application_id", "user_id"],
                isUnique: true,
                where: "revoked_at != NULL",
            }),
            new TableIndex({
                name: "UQ:access_tokens:token",
                columnNames: ["token"],
                isUnique: true,
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        for (const indexName of [
            "UQ:access_tokens:application_id:user_id::only_not_revoked",
            "UQ:access_tokens:token",
        ]) {
            await queryRunner.dropIndex("access_tokens", indexName)
        }
    }
}
