import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { Matches, MaxLength } from "class-validator"

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    @MaxLength(20)
    name!: string

    @Column({ name: "screen_name", length: "20", nullable: false })
    @Matches(/^[0-9A-Za-z_]{1,20}$/)
    screenName!: string

    @Column({ name: "encrypted_password", nullable: false })
    encryptedPassword!: string

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date
}
