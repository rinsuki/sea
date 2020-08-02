import { TableColumnOptions } from "typeorm/schema-builder/options/TableColumnOptions"
import { CreateDateColumn, UpdateDateColumn } from "typeorm"

export const timestampColumns = {
    PLEASE_USE_ONLY_FOR_MIGRATION_BACKWARD_COMPATIBILITY_forMigrations: [
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
    forMigrations: [
        {
            name: "created_at",
            type: "timestamptz",
            isNullable: false,
            default: "NOW()",
        },
        {
            name: "updated_at",
            type: "timestamptz",
            isNullable: false,
            default: "NOW()",
        },
    ] as TableColumnOptions[],
}

export class EntityWithTimestamps {
    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date
}
