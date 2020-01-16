import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddPostsCountToUsersTable1556641350299
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "posts_count",
                type: "int",
                default: 0,
            })
        )
        const res = await queryRunner.query(
            "SELECT count(*) as count, user_id as id FROM posts GROUP BY user_id"
        )
        for (const { count, id } of res) {
            await queryRunner.query(
                "UPDATE users SET posts_count=$1 WHERE id=$2",
                [count, id]
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("users", "posts_count")
    }
}
