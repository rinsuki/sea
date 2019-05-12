import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from "typeorm"
import { Post } from "./post"
import { AlbumFile } from "./albumFile"

@Entity("posts_attached_files")
export class PostAttachedFile {
    @Column({ name: "post_id", type: "int", nullable: false })
    postId!: number

    @ManyToOne(type => Post, {
        primary: true,
    })
    @JoinColumn({ name: "post_id", referencedColumnName: "id" })
    post!: Post

    @ManyToOne(type => AlbumFile, {
        primary: true,
    })
    @JoinColumn({ name: "album_file_id", referencedColumnName: "id" })
    albumFile!: AlbumFile

    @Column({ type: "int", nullable: false })
    order!: number
}
