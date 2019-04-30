import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddRevokedAtColumnToAccessTokensTable1556620261469
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "access_tokens",
            new TableColumn({
                name: "revoked_at",
                type: "timestamp",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("access_tokens", "revoked_at")
    }
}
