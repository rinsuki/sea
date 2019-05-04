import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableForeignKey,
} from "typeorm"
import { timestampColumns } from "../../utils/timestampColumns"

export class CreateInviteCodesTable1556992632407 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: "invite_codes",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "from_user_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "to_user_id",
                        type: "int",
                        isNullable: true,
                        isUnique: true,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "16",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "memo",
                        type: "varchar",
                        length: "64",
                        isNullable: false,
                    },
                    ...timestampColumns.forMigrations,
                ],
                foreignKeys: [
                    {
                        name: "FK:invite_codes:from_user_id::users:id",
                        columnNames: ["from_user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                    {
                        name: "FK:invite_codes:to_user_id::users:id",
                        columnNames: ["to_user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        )
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "invite_code_id",
                type: "int",
                isNullable: true,
            })
        )
        await queryRunner.createForeignKey(
            "users",
            new TableForeignKey({
                name: "FK:users:invite_code_id::invite_codes:id",
                columnNames: ["invite_code_id"],
                referencedTableName: "invite_codes",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        )
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "can_make_invite_code",
                type: "boolean",
                default: "FALSE",
                isNullable: false,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropColumn("users", "can_make_invite_code")
        await queryRunner.dropForeignKey(
            "users",
            "FK:users:invite_code_id::invite_codes:id"
        )
        await queryRunner.dropColumn("users", "invite_code_id")
        await queryRunner.dropTable("invite_codes")
    }
}
