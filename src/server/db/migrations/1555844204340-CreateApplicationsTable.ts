import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateApplicationsTable1555844204340 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "applications",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "32",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "owner_user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "client_id",
                        type: "varchar",
                        length: "64",
                        isNullable: false,
                    },
                    {
                        name: "client_secret",
                        type: "varchar",
                        length: "64",
                        isNullable: false,
                    },
                    {
                        name: "redirect_uri",
                        type: "text",
                        isNullable: false,
                        default: "''",
                    },
                    ...timestampColumns.PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:applications:owner_user_id::users:id",
                        columnNames: ["owner_user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("applications")
    }
}
