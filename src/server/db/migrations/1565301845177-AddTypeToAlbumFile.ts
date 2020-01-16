import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddTypeToAlbumFile1565301845177 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "album_files",
            new TableColumn({
                name: "type",
                type: "enum",
                enum: ["image", "video"],
                default: "'image'", // :thinking_face:
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("album_files", "type")
    }
}
