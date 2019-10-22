import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddIsPublicToApplication1571739876148 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "applications",
            new TableColumn({
                name: "is_public",
                type: "bool",
                default: false,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("applications", "is_public")
    }
}
