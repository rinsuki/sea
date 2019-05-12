import { MigrationInterface, QueryRunner, Table } from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateAlbumFileVariantsTable1557574235101 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "album_file_variants",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "album_file_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "score",
                        type: "smallint",
                        isNullable: false,
                    },
                    {
                        name: "extension",
                        type: "varchar",
                        length: "8",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "varchar",
                        length: "32",
                        isNullable: false,
                    },
                    {
                        name: "size",
                        type: "int",
                        isNullable: false,
                    },
                    ...timestampColumns.forMigrations,
                ],
                foreignKeys: [
                    {
                        columnNames: ["album_file_id"],
                        referencedTableName: "album_files",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable("album_file_variants")
    }
}
