import { Entity, ManyToOne, Column, ColumnOptions, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { AlbumFile } from "./albumFile"
import path from "path"
import { EXT2MIME } from "../../constants"
import { getPathFromHash } from "../../utils/getPathFromHash"

@Entity("album_file_variants")
export class AlbumFileVariant extends EntityWithTimestamps {
    @PrimaryGeneratedColumn("increment")
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

    @Column({ type: "varchar", length: 128, nullable: true })
    hash!: string

    @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
    deletedAt!: Date | null

    toPath() {
        if (this.hash == null) {
            return path.join(this.albumFile.toPath(), [this.type, this.extension].join("."))
        }
        return getPathFromHash(this.hash)
    }
}
