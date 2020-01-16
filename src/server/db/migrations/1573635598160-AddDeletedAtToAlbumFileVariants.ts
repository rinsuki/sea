import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm"

export class AddDeletedAtToAlbumFileVariants1573635598160 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "album_file_variants",
            new TableColumn({
                name: "deleted_at",
                type: "timestamptz",
                isNullable: true,
                default: "NULL",
            })
        )
        await queryRunner.createIndex(
            "album_file_variants",
            new TableIndex({
                name: "IDX:album_file_variants:album_file_id::only_not_deleted",
                columnNames: ["album_file_id"],
                where: "deleted_at IS NULL",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropIndex("album_file_variants", "IDX:album_file_variants:album_file_id::only_not_deleted")
        await queryRunner.dropColumn("album_file_variants", "deleted_at")
    }
}
