import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUserSessionsTable1555610572643
    implements MigrationInterface {
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
                    {
                        name: "created_at",
                        type: "timestamp",
                        isNullable: false,
                        default: "NOW()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        isNullable: false,
                        default: "NOW()",
                    },
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
