import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateSubscriptionsTable1560322139588 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "subscriptions",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "endpoint",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "public_key",
                        type: "varchar",
                        length: "87",
                        isNullable: false,
                    },
                    {
                        name: "authentication_secret",
                        type: "varchar",
                        length: "22",
                        isNullable: false,
                    },
                    {
                        name: "user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "application_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "revoked_at",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    ...timestampColumns.PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:subscriptions:user_id::users:id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                    {
                        name: "FK:subscriptions:application_id::applications:id",
                        columnNames: ["application_id"],
                        referencedTableName: "applications",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("subscriptions")
    }
}
