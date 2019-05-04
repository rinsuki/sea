import { getConnection, createConnection, getConnectionOptions } from "typeorm"
import { MigrationExecutor } from "typeorm/migration/MigrationExecutor"

async function main() {
    const config = await getConnectionOptions()
    await createConnection({
        ...config,
        logging: ["query"],
    })
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
    const remainTables: { tablename: string }[] = await queryRunner.query(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public' AND tablename!='migrations'"
    )
    if (remainTables.length) {
        console.error("いくつかのテーブルがまだ残っています:")
        for (const { tablename: table } of remainTables) {
            console.log(`- ${table}`)
        }
        process.exit(1)
    }
    process.exit(0)
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
