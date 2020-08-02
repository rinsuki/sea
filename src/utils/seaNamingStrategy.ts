import { DefaultNamingStrategy, NamingStrategyInterface, Table } from "typeorm"

export class SeaNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    foreignKeyName(
        tableOrName: Table | string,
        columnNames: string[],
        referencedTablePath?: string,
        referencedColumnNames?: string[]
    ): string {
        const tableName = typeof tableOrName == "string" ? tableOrName : tableOrName.name
        return `FK:${tableName}:${columnNames.join(":")}::${referencedTablePath}:${referencedColumnNames!.join(":")}`
    }
}
