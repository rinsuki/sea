import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class AddInReplyToIdToPost1579290924179 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "posts",
            new TableColumn({
                name: "in_reply_to_id",
                type: "int",
                isNullable: true,
            })
        )
        await queryRunner.createForeignKey(
            "posts",
            new TableForeignKey({
                name: "FK:posts:in_reply_to_id::posts:id",
                columnNames: ["in_reply_to_id"],
                referencedTableName: "posts",
                referencedColumnNames: ["id"],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey("posts", "FK:posts:in_reply_to_id::posts:id")
        await queryRunner.dropColumn("posts", "in_reply_to_id")
    }
}
