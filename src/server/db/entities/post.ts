import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToMany } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { Application } from "./application"
import { AlbumFile } from "./albumFile"
import { PostAttachedFile } from "./postAttachedFile"

@Entity("posts")
export class Post extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: "text", nullable: false, type: "varchar", length: 512 })
    text!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @ManyToOne(type => Application)
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @OneToMany(type => PostAttachedFile, file => file.post)
    files!: PostAttachedFile[]
}
