import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { randomBytes } from "crypto"
import { Application } from "./application"

@Entity("access_tokens")
export class AccessToken extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: "token", type: "varchar", length: 64, nullable: false })
    token!: string

    @ManyToOne(type => Application)
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt!: Date | null

    generateToken() {
        this.token = randomBytes(32).toString("hex")
    }
}
