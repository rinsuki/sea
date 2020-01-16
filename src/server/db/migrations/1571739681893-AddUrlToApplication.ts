import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddUrlToApplication1571739681893 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "applications",
            new TableColumn({
                name: "url",
                type: "text",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("applications", "url")
    }
}
