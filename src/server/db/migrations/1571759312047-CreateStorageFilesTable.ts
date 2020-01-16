import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateStorageFilesTable1571759312047 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "storage_files",
                columns: [
                    {
                        name: "hash",
                        type: "varchar",
                        length: "128",
                        isPrimary: true,
                    },
                    ...timestampColumns.forMigrations,
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("storage_files")
    }
}
