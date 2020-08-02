import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./user"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("applications")
export class Application extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 32 })
    name!: string

    @Column({ type: "text", name: "description" })
    description!: string

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
    ownerUser!: User

    @Column({ type: "varchar", length: 64, name: "client_id" })
    clientId!: string

    @Column({ type: "varchar", length: 64, name: "client_secret" })
    clientSecret!: string

    @Column({
        type: "text",
        name: "redirect_uri",
    })
    redirectUri!: string

    @Column({ name: "is_automated", default: false })
    isAutomated!: boolean

    @Column({ name: "url", type: "text", nullable: true })
    url!: string | null

    @Column({ name: "is_public", default: false })
    isPublic!: boolean
}
