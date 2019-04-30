import { TableColumnOptions } from "typeorm/schema-builder/options/TableColumnOptions"
import { CreateDateColumn, UpdateDateColumn } from "typeorm"

export const timestampColumns = {
    forMigrations: [
        {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "NOW()",
        },
        {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "NOW()",
        },
    ] as TableColumnOptions[],
}

export class EntityWithTimestamps {
    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date
}
