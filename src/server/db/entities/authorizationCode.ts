import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm"
import { Application } from "./application"
import { User } from "./user"
import { randomBytes } from "crypto"
import { EntityWithTimestamps } from "../../utils/timestampColumns"

@Entity("authorization_codes")
export class AuthorizationCode extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(type => Application)
    @JoinColumn({ name: "application_id", referencedColumnName: "id" })
    application!: Application

    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user!: User

    @Column({ name: "code", length: 16, nullable: false, unique: true })
    code!: string

    @Column({ name: "state", type: "text", nullable: true })
    state!: string | null

    generateCode() {
        this.code = randomBytes(8).toString("hex")
    }
}
