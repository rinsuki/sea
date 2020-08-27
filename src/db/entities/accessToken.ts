import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { randomBytes } from "crypto"
import { Application } from "./application"

@Entity("access_tokens")
@Index("UQ:access_tokens:token", ["token"], { unique: true })
@Index("UQ:access_tokens:application_id:user_id::only_not_revoked", ["application", "user"], {
    where: "revoked_at IS NULL",
    unique: true,
})
export class AccessToken extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: "token", type: "varchar", length: 64, nullable: false })
    token!: string

    @ManyToOne(type => Application, { nullable: false })
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt!: Date | null

    generateToken() {
        this.token = randomBytes(32).toString("hex")
    }
}
