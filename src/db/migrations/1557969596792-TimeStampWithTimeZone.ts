import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class TimeStampWithTimeZone1557969596792 implements MigrationInterface {
    readonly targets: [string, string][] = [
        ...[
            "access_tokens",
            "album_files",
            "album_file_variants",
            "applications",
            "authorization_codes",
            "invite_codes",
            "posts",
            "users",
            "user_sessions",
        ].flatMap(table => [[table, "created_at"], [table, "updated_at"]] as [string, string][]),
        ["user_sessions", "disabled_at"],
        ["access_tokens", "revoked_at"],
    ]

    public async up(queryRunner: QueryRunner): Promise<any> {
        for (const [table, column] of this.targets) {
            await queryRunner.query(`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE timestamptz`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        for (const [table, column] of this.targets) {
            await queryRunner.query(`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE timestamp`)
        }
    }
}
