import { EntityRepository, Repository, getCustomRepository } from "typeorm"
import { Post } from "../entities/post"
import { UserRepository } from "./user"
import { ApplicationRepository } from "./application"
import { AlbumFileRepository } from "./albumFile"
import { onlyUnique } from "../../utils/onlyUnique"

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
    async pack(post: Post) {
        return (await this.packMany([post]))[0]
    }

    async packMany(posts: Post[]) {
        const users = await getCustomRepository(UserRepository).packMany(onlyUnique(posts.map(p => p.user), "id"))
        return Promise.all(
            posts.map(async post => ({
                id: post.id,
                text: post.text,
                user: users.find(u => u.id === post.user.id),
                application: await getCustomRepository(ApplicationRepository).pack(post.application),
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                files: await getCustomRepository(AlbumFileRepository).packMany(
                    post.files.sort((a, b) => a.order - b.order).map(f => f.albumFile)
                ),
            }))
        )
    }
}
