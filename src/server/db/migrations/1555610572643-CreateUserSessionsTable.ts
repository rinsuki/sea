import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateUserSessionsTable1555610572643 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "user_sessions",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "secret",
                        type: "varchar",
                        length: "256",
                        isNullable: false,
                    },
                    {
                        name: "user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "user_agent",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "created_ip_address",
                        type: "inet",
                        isNullable: false,
                    },
                    ...timestampColumns.PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:user_sessions:user_id::users:id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("user_sessions")
    }
}
