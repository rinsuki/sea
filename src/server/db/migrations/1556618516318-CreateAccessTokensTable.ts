import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateAccessTokensTable1556618516318 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "access_tokens",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "token",
                        type: "varchar",
                        length: "64",
                        isNullable: false,
                    },
                    {
                        name: "application_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "user_id",
                        type: "int",
                        isNullable: false,
                    },
                    ...timestampColumns.PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:access_tokens:application_id::applications:id",
                        columnNames: ["application_id"],
                        referencedTableName: "applications",
                        referencedColumnNames: ["id"],
                    },
                    {
                        name: "FK:access_tokens:user_id::users:id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("access_tokens")
    }
}
