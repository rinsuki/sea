import { EntityRepository, Repository, getCustomRepository } from "typeorm"
import { User } from "../entities/user"
import { AlbumFileRepository } from "./albumFile"
import { isNotNull } from "../../utils/isNotNull"

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async pack(user: User) {
        return (await this.packMany([user]))[0]
    }

    async packMany(users: User[]) {
        const avatars = await getCustomRepository(AlbumFileRepository).packMany(users.map(u => u.avatarFile).filter(isNotNull))
        return users.map(user => {
            const avatarFile = user.avatarFile != null ? avatars.find(f => f.id === user.avatarFile!.id) : null
            return {
                id: user.id,
                name: user.name,
                screenName: user.screenName,
                postsCount: user.postsCount,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                avatarFile,
            }
        })
    }
}
