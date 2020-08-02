import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, Column, JoinColumn } from "typeorm"
import { EntityWithTimestamps } from "../../utils/timestampColumns"
import { User } from "./user"
import { randomBytes } from "crypto"

@Entity("invite_codes")
export class InviteCode extends EntityWithTimestamps {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: "from_user_id", referencedColumnName: "id" })
    fromUser!: User

    @OneToOne(type => User)
    @JoinColumn({ name: "to_user_id", referencedColumnName: "id" })
    toUser!: User | null

    @Column({
        name: "code",
        type: "varchar",
        length: 16,
        nullable: false,
        unique: true,
    })
    code!: string

    @Column({
        name: "memo",
        type: "varchar",
        length: "64",
        nullable: false,
    })
    memo!: string

    generateCode() {
        this.code = randomBytes(8).toString("hex")
    }
}
