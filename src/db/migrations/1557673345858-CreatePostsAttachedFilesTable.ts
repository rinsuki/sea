import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreatePostsAttachedFilesTable1557673345858 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "posts_attached_files",
                columns: [
                    {
                        name: "post_id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "album_file_id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "order",
                        type: "int",
                        isNullable: false,
                    },
                ],
                uniques: [
                    {
                        name: "UQ:posts_attached_files:post_id:album_file_id:order",
                        columnNames: ["post_id", "album_file_id", "order"],
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["post_id"],
                        referencedTableName: "posts",
                        referencedColumnNames: ["id"],
                    },
                    {
                        columnNames: ["album_file_id"],
                        referencedTableName: "album_files",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {}
}
