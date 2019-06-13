import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { Application } from "./application"

@Entity("subscriptions")
export class Subscription extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    endpoint!: string

    @Column({ name: "public_key", nullable: false })
    publicKey!: string

    @Column({ name: "authentication_secret", nullable: false })
    authenticationSecret!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @ManyToOne(type => Application)
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt!: Date | null
}
