import {MigrationInterface, QueryRunner} from "typeorm";

export class EnableCITextExtension1555355416048 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE EXTENSION CITEXT")
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP EXTENSION CITEXT")
    }
}
