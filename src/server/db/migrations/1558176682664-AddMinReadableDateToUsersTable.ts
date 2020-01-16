import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddMinReadableDateToUsersTable1558176682664 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "min_readable_date",
                type: "timestamptz",
                default: "'2999-12-31'",
            })
        )
        await queryRunner.query("UPDATE users SET min_readable_date='1970-01-01' WHERE invite_code_id IS NOT NULL")
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("users", "min_readable_date")
    }
}
