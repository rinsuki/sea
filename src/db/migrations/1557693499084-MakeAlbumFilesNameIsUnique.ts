import { MigrationInterface, QueryRunner, TableIndex, TableColumn } from "typeorm"
import { TableUnique } from "typeorm/schema-builder/table/TableUnique"

export class MakeAlbumFilesNameIsUnique1557693499084 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        // その前に: もう被ってる名前があったら変更する
        await queryRunner.addColumn(
            "album_files",
            new TableColumn({
                name: "_backup_name",
                type: "varchar",
                length: "256",
                comment: "for migration MakeAlbumFilesNameIsUnique1557693499084",
                isNullable: true,
            })
        )
        await queryRunner.query(
            `UPDATE album_files SET 
                _backup_name=name,
                name=name || ' - Auto Renamed (name conflict) (' || to_char(created_at, 'YYYY-MM-DD_HH24-MI-SS_US') || ')' 
            WHERE id IN 
                (SELECT unnest((array_agg(id ORDER BY id ASC))[2:]) FROM album_files GROUP BY name, user_id HAVING COUNT(*) > 1)`
        )
        await queryRunner.createIndex(
            "album_files",
            new TableIndex({
                name: "UQ:album_files:name:user_id",
                columnNames: ["name", "user_id"],
                isUnique: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropIndex("album_files", "UQ:album_files:name:user_id")
        await queryRunner.query("UPDATE album_files SET name=_backup_name WHERE _backup_name IS NOT NULL")
        await queryRunner.dropColumn("album_files", "_backup_name")
    }
}
