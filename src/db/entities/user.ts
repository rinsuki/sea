import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm"
import { Matches, MaxLength } from "class-validator"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { InviteCode } from "./inviteCode"
import { AlbumFile } from "./albumFile"

@Entity("users")
export class User extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    @MaxLength(20)
    name!: string

    @Column({ name: "screen_name", length: "20", nullable: false })
    @Matches(/^[0-9A-Za-z_]{1,20}$/)
    screenName!: string

    @Column({ name: "display_screen_name", nullable: false })
    displayScreenName!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "owner_id", referencedColumnName: "id" })
    owner!: User | null

    @Column({ name: "owner_screen_name", type: "citext", nullable: true })
    @Matches(/^[0-9A-Za-z_]{1,20}$/)
    ownerScreenName!: string | null

    @Column({ name: "encrypted_password", nullable: false })
    encryptedPassword!: string

    @Column({ name: "posts_count", type: "int", nullable: false })
    postsCount!: number

    @OneToOne(type => InviteCode)
    @JoinColumn({ name: "invite_code_id", referencedColumnName: "id" })
    inviteCode!: InviteCode | null

    @Column({
        name: "can_make_invite_code",
        type: "boolean",
        default: "FALSE",
        nullable: false,
    })
    canMakeInviteCode!: boolean

    @OneToOne(type => AlbumFile)
    @JoinColumn({ name: "avatar_file_id", referencedColumnName: "id" })
    avatarFile!: AlbumFile | null

    @Column({ name: "min_readable_date", type: "timestamptz", nullable: false })
    minReadableDate!: Date
}
