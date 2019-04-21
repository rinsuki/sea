import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { User } from "./user"
import { createHash } from "crypto"

@Entity("user_sessions")
export class UserSession {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    secret!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "user_agent", nullable: false })
    userAgent!: string

    @Column({ name: "created_ip_address", nullable: false })
    createdIpAddress!: string

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date

    @Column({ name: "disabled_at", type: "date", nullable: true })
    disabledAt!: Date | null

    getCookieValue(): string {
        return `${this.id}:${createHash("sha512")
            .update(this.secret)
            .digest("hex")}`
    }
}
