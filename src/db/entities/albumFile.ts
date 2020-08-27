import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Index } from "typeorm"
import { User } from "./user"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import path from "path"
import { AlbumFileVariant } from "./albumFileVariant"

export enum AlbumFileType {
    IMAGE = "image",
    VIDEO = "video",
}

@Entity("album_files")
@Index("UQ:album_files:name:user_id", ["name", "user"], { unique: true })
export class AlbumFile extends EntityWithTimestamps {
    @PrimaryGeneratedColumn("increment")
    id!: number

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "name", type: "varchar", length: 256 })
    name!: string

    @Column({ name: "type", type: "enum", enum: AlbumFileType, default: AlbumFileType.IMAGE })
    type!: AlbumFileType

    @OneToMany(
        type => AlbumFileVariant,
        variant => variant.albumFile
    )
    variants!: AlbumFileVariant[]

    @Column({ name: "_backup_name", type: "varchar", length: 256, nullable: true })
    _backupName!: string

    toPath() {
        const padNumber = 8
        const fileIdWithPadding = this.id.toString(16).padStart(padNumber, "0")
        if (fileIdWithPadding.length > padNumber) {
            throw "file id overflow. please incrase pad number"
        }
        return path.join("album_files", fileIdWithPadding.replace(/(.{2})/g, "$1/"))
    }
}
