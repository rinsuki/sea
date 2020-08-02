import { Entity, PrimaryColumn, Column } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("storage_files")
export class StorageFile extends EntityWithTimestamps {
    @PrimaryColumn({ type: "varchar", length: 128 })
    hash!: string

    @Column({ type: "integer", nullable: true })
    size!: number
}
