import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddIsAutomatedToApplication1559223313690 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.addColumn(
            "applications",
            new TableColumn({
                name: "is_automated",
                type: "bool",
                default: false,
                isNullable: false,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.dropColumn("applications", "is_automated")
    }
}
