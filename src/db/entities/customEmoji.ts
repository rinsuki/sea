import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { PrimaryColumn, ManyToOne, JoinColumn, Column, Entity } from "typeorm"
import { User } from "./user"

@Entity("custom_emojis")
export class CustomEmoji extends EntityWithTimestamps {
    @PrimaryColumn()
    id!: number

    @Column({ type: "citext", nullable: false })
    shortcode!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ type: "varchar", nullable: false })
    hash!: string

    @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
    deletedAt!: Date | null
}
