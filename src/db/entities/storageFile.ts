import { Entity, PrimaryColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("storage_files")
export class StorageFile extends EntityWithTimestamps {
    @PrimaryColumn()
    hash!: string
}
