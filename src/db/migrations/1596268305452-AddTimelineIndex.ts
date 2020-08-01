import { MigrationInterface, QueryRunner, TableIndex } from "typeorm"

export class AddTimelineIndex1596268305452 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createIndex(
            "posts",
            new TableIndex({
                name: "IDX:posts:created_at",
                columnNames: ["createdAt"],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropIndex("posts", "IDX:posts:created_at")
    }
}
