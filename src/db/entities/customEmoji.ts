import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { PrimaryColumn, ManyToOne, JoinColumn, Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user"

@Entity("custom_emojis")
export class CustomEmoji extends EntityWithTimestamps {
    @PrimaryGeneratedColumn("increment")
    id!: number

    @Column({ type: "citext", nullable: false })
    shortcode!: string

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ type: "varchar", length: 128, nullable: false })
    hash!: string

    @Column({ type: "int", nullable: false })
    width!: number

    @Column({ type: "int", nullable: false })
    height!: number

    @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
    deletedAt!: Date | null
}
