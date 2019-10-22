import { Entity, ManyToOne, Column, ColumnOptions, JoinColumn, PrimaryColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { AlbumFile } from "./albumFile"
import path from "path"
import { EXT2MIME } from "../../constants"
import { getPathFromHash } from "../../utils/getPathFromHash"

@Entity("album_file_variants")
export class AlbumFileVariant extends EntityWithTimestamps {
    @PrimaryColumn()
    id!: number

    @ManyToOne(type => AlbumFile)
    @JoinColumn({ name: "album_file_id", referencedColumnName: "id" })
    albumFile!: AlbumFile

    @Column({ name: "album_file_id", type: "int", nullable: false })
    albumFileId!: number

    @Column({ type: "smallint", nullable: false })
    score!: number

    @Column({ type: "varchar", length: "8", nullable: false })
    extension!: keyof typeof EXT2MIME

    @Column({ type: "varchar", length: "32", nullable: false })
    type!: string

    @Column({ type: "int", nullable: false })
    size!: number

    @Column({ type: "varchar", nullable: true })
    hash!: string

    toPath() {
        if (this.hash) {
            return getPathFromHash(this.hash)
        } else {
            return path.join(this.albumFile.toPath(), [this.type, this.extension].join("."))
        }
    }
}
