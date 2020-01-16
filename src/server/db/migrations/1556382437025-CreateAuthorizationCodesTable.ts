import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateAuthorizationCodesTable1556382437025 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "authorization_codes",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    { name: "application_id", type: "int", isNullable: false },
                    { name: "user_id", type: "int", isNullable: false },
                    {
                        name: "code",
                        type: "varchar",
                        length: "16",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "state",
                        type: "text",
                        isNullable: true,
                    },
                    ...timestampColumns.PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:authorization_codes:application_id::applications:id",
                        columnNames: ["application_id"],
                        referencedTableName: "applications",
                        referencedColumnNames: ["id"],
                    },
                    {
                        name: "FK:authorization_codes:user_id::users::id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("authorization_codes")
    }
}
