import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class AddAvatarFileIdToUsersTable1557886992273 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "avatar_file_id",
                type: "int",
                isNullable: true,
            })
        )
        await queryRunner.createForeignKey(
            "users",
            new TableForeignKey({
                name: "FK:users:avatar_file_id::album_files:id",
                columnNames: ["avatar_file_id"],
                referencedTableName: "album_files",
                referencedColumnNames: ["id"],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey("users", "FK:users:avatar_file_id::album_files:id")
        await queryRunner.dropColumn("users", "avatar_file_id")
    }
}
