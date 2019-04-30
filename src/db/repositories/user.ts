import { EntityRepository, Repository } from "typeorm"
import { User } from "../entities/user"

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async pack(user: User) {
        return (await this.packMany([user]))[0]
    }

    async packMany(users: User[]) {
        return users.map(user => ({
            id: user.id,
            name: user.name,
            screenName: user.screenName,
            postsCount: user.postsCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }))
    }
}
