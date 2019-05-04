import { getConnection, createConnection } from "typeorm"
import { MigrationExecutor } from "typeorm/migration/MigrationExecutor"

async function main() {
    await createConnection()
    const connection = getConnection()
    const queryRunner = connection.createQueryRunner("master")
    let count = parseInt(
        (await queryRunner.query("SELECT COUNT(*) as count FROM migrations"))[0]
            .count
    )
    console.log(count)
    const migrationExecutor = new MigrationExecutor(connection)
    while (--count) {
        await migrationExecutor.undoLastMigration()
    }
    process.exit(0)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
