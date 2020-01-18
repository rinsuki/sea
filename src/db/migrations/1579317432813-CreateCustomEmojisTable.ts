import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateCustomEmojisTable1579317432813 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "custom_emojis",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "shortcode",
                        type: "citext",
                        isNullable: false,
                    },
                    {
                        name: "user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "hash",
                        type: "varchar",
                        length: "128",
                        isNullable: false,
                    },
                    {
                        name: "width",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "height",
                        type: "int",
                        isNullable: false,
                    },
                    ...timestampColumns.forMigrations,
                    {
                        name: "deleted_at",
                        type: "timestamptz",
                    },
                ],
                foreignKeys: [
                    {
                        name: "FK:custom_emojis:hash::storage_files:hash",
                        columnNames: ["hash"],
                        referencedTableName: "storage_files",
                        referencedColumnNames: ["hash"],
                    },
                    {
                        name: "FK:custom_emojis:user_id::users::id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                ],
                indices: [
                    {
                        name: "IDX:custom_emojis:shortcode:::not_deleted",
                        columnNames: ["shortcode"],
                        where: "deleted_at IS NULL",
                        isUnique: true,
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("custom_emojis")
    }
}
