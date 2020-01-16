import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from "typeorm"
import { User } from "./user"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import path from "path"
import { AlbumFileVariant } from "./albumFileVariant"

export enum AlbumFileType {
    IMAGE = "image",
    VIDEO = "video",
}

@Entity("album_files")
export class AlbumFile extends EntityWithTimestamps {
    @PrimaryColumn()
    id!: number

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "name" })
    name!: string

    @Column({ name: "type", type: "enum", enum: AlbumFileType })
    type!: AlbumFileType

    @OneToMany(type => AlbumFileVariant, variant => variant.albumFile)
    variants!: AlbumFileVariant[]

    toPath() {
        const padNumber = 8
        const fileIdWithPadding = this.id.toString(16).padStart(padNumber, "0")
        if (fileIdWithPadding.length > padNumber) {
            throw "file id overflow. please incrase pad number"
        }
        return path.join("album_files", fileIdWithPadding.replace(/(.{2})/g, "$1/"))
    }
}
