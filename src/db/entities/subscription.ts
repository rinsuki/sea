import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { Application } from "./application"

@Entity("subscriptions")
export class Subscription extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "text", nullable: true })
    description!: string

    @Column({ type: "text", nullable: false })
    endpoint!: string

    @Column({ type: "varchar", length: 87, name: "public_key", nullable: false })
    publicKey!: string

    @Column({ type: "varchar", length: 22, name: "authentication_secret", nullable: false })
    authenticationSecret!: string

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @ManyToOne(type => Application, { nullable: false })
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @Column({ name: "failed_at", type: "timestamptz", nullable: true })
    failedAt!: Date | null

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt!: Date | null
}
