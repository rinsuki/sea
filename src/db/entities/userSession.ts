import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./user"
import { createHash } from "crypto"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("user_sessions")
export class UserSession extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 256, nullable: false })
    secret!: string

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ type: "text", name: "user_agent", nullable: false })
    userAgent!: string

    @Column({ type: "inet", name: "created_ip_address", nullable: false })
    createdIpAddress!: string

    @Column({ name: "disabled_at", type: "timestamptz", nullable: true })
    disabledAt!: Date | null

    getCookieValue(): string {
        return `${this.id}:${createHash("sha512")
            .update(this.secret)
            .digest("hex")}`
    }
}
