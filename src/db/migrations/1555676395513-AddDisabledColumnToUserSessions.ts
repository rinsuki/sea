import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddDisabledColumnToUserSessions1555676395513
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            "user_sessions",
            new TableColumn({
                name: "disabled_at",
                type: "timestamp",
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("user_sessions", "disabled_at")
    }
}
