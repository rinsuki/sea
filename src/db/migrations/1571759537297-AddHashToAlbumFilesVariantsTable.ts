import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class AddHashToAlbumFilesVariantsTable1571759537297 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "album_file_variants",
            new TableColumn({
                name: "hash",
                type: "varchar",
                length: "128",
                isNullable: true,
            })
        )
        await queryRunner.createForeignKey(
            "album_file_variants",
            new TableForeignKey({
                name: "FK:album_file_variants:hash::storage_files:hash",
                columnNames: ["hash"],
                referencedTableName: "storage_files",
                referencedColumnNames: ["hash"],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey("album_file_variants", "FK:album_file_variants:hash::storage_files:hash")
        await queryRunner.dropColumn("album_file_variants", "hash")
    }
}
