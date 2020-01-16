import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class ExtendUserNameLengthLimitTo501563947120001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE users ALTER COLUMN name TYPE varchar(50)")
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE users ALTER COLUMN name TYPE varchar(20)")
    }
}
