import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUsersTable1555359483422 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "users",
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
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "screen_name",
                        type: "citext",
                        isNullable: false,
                    },
                    {
                        name: "encrypted_password",
                        type: "text",
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
                indices: [
                    {
                        name: "UQ:users:screen_name",
                        columnNames: ["screen_name"],
                        isUnique: true,
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("users")
    }
}
