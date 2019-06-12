import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./user"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

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

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt!: Date | null
}
