import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddSizeToStorageFile1579318658309 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "storage_files",
            new TableColumn({
                name: "size",
                type: "int",
                isNullable: true,
            })
        )
        await queryRunner.query(
            "UPDATE storage_files SET size=(SELECT size FROM album_file_variants WHERE hash=storage_files.hash LIMIT 1)"
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("storage_files", "size")
    }
}
