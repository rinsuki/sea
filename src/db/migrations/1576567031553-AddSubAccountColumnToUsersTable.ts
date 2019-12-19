import { MigrationInterface, QueryRunner, TableColumn, TableIndex, TableForeignKey, TableCheck } from "typeorm"

export class AddSubAccountColumnToUsersTable1576567031553 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumns("users", [
            new TableColumn({ name: "owner_id", type: "int", isNullable: true }),
            new TableColumn({ name: "owner_screen_name", type: "citext", isNullable: true }),
            new TableColumn({ name: "display_screen_name", type: "citext", isNullable: true }),
        ])
        await queryRunner.dropIndex("users", "UQ:users:screen_name")
        await queryRunner.createIndices("users", [
            new TableIndex({
                name: "UQ:users:screen_name",
                columnNames: ["screen_name"],
                where: "owner_screen_name IS NULL",
                isUnique: true,
            }),
            new TableIndex({
                name: "UQ:users:screen_name:owner_screen_name",
                columnNames: ["screen_name", "owner_screen_name"],
                where: "owner_screen_name IS NOT NULL",
                isUnique: true,
            }),
            new TableIndex({
                name: "UQ:users:display_screen_name",
                columnNames: ["display_screen_name"],
                isUnique: true,
            }),
        ])
        await queryRunner.query("UPDATE users SET display_screen_name = screen_name")
        await queryRunner.query("ALTER TABLE users ALTER COLUMN display_screen_name SET NOT NULL")
        await queryRunner.createCheckConstraint(
            "users",
            new TableCheck({
                name: "CHK:users:display_screen_name",
                columnNames: ["display_screen_name"],
                expression: "display_screen_name = COALESCE(screen_name || '.' || owner_screen_name, screen_name)",
            })
        )
        await queryRunner.createForeignKeys("users", [
            new TableForeignKey({
                name: "FK:users:owner_id::users:id",
                columnNames: ["owner_id"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "RESTRICT",
                onUpdate: "CASCADE",
            }),
            new TableForeignKey({
                name: "FK:users:owner_screen_name::users:screen_name",
                columnNames: ["owner_screen_name"],
                referencedTableName: "users",
                referencedColumnNames: ["display_screen_name"],
                onDelete: "RESTRICT",
                onUpdate: "CASCADE",
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey("users", "FK:users:owner_id::users:id")
        await queryRunner.dropForeignKey("users", "FK:users:owner_screen_name::users:screen_name")
        await queryRunner.dropIndex("users", "UQ:users:screen_name")
        await queryRunner.dropIndex("users", "UQ:users:screen_name:owner_screen_name")
        await queryRunner.dropIndex("users", "UQ:users:display_screen_name")
        await queryRunner.dropCheckConstraint("users", "CHK:users:display_screen_name")
        await queryRunner.dropColumn("users", "owner_id")
        await queryRunner.dropColumn("users", "owner_screen_name")
        await queryRunner.dropColumn("users", "screen_name")
        await queryRunner.renameColumn("users", "display_screen_name", "screen_name")
        await queryRunner.createIndex(
            "users",
            new TableIndex({
                name: "UQ:users:screen_name",
                columnNames: ["screen_name"],
                isUnique: true,
            })
        )
    }
}
