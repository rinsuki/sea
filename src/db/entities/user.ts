import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"
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
    avatarFile?: AlbumFile

    @Column({ name: "min_readable_date", type: "timestamptz", nullable: false })
    minReadableDate!: Date
}
