import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreatePostsTable1556640394508 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "posts",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "text",
                        type: "varchar",
                        length: "512",
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
                    ...timestampColumns.forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:posts:user_id::users:id",
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                    {
                        name: "FK:posts:application_id::applications:id",
                        columnNames: ["application_id"],
                        referencedTableName: "applications",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("posts")
    }
}
