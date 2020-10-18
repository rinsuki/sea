import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { InviteCode } from "./inviteCode"
import { AlbumFile } from "./albumFile"

@Entity("users")
@Index("UQ:users:screen_name", ["screenName"], { unique: true })
export class User extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 50, nullable: false })
    name!: string

    @Column({ name: "screen_name", nullable: false })
    screenName!: string

    @Column({ name: "encrypted_password", type: "text", nullable: false })
    encryptedPassword!: string

    @Column({ name: "posts_count", type: "int", nullable: false, default: 0 })
    postsCount!: number

    @OneToOne(type => InviteCode)
    @JoinColumn({ name: "invite_code_id", referencedColumnName: "id" })
    inviteCode!: InviteCode | null

    @Column({
        name: "can_make_invite_code",
        type: "boolean",
        default: () => "FALSE",
        nullable: false,
    })
    canMakeInviteCode!: boolean

    @OneToOne(type => AlbumFile)
    @JoinColumn({ name: "avatar_file_id", referencedColumnName: "id" })
    avatarFile!: AlbumFile | null

    @Column({ name: "min_readable_date", type: "timestamptz", nullable: false, default: "2999-12-31 09:00:00+09" })
    minReadableDate!: Date
}
