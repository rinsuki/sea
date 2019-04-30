import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm"
import { User } from "./user"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("applications")
export class Application extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: "name" })
    name!: string

    @Column({ name: "description" })
    description!: string

    @ManyToOne(type => User)
    @JoinColumn({ name: "owner_user_id", referencedColumnName: "id" })
    ownerUser!: User

    @Column({ name: "client_id" })
    clientId!: string

    @Column({ name: "client_secret" })
    clientSecret!: string

    @Column({
        name: "redirect_uri",
    })
    redirectUri!: string
}
