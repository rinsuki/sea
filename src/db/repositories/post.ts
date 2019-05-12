import { EntityRepository, Repository, getCustomRepository } from "typeorm"
import { Post } from "../entities/post"
import { UserRepository } from "./user"
import { ApplicationRepository } from "./application"
import { AlbumFileRepository } from "./albumFile"

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
    async pack(post: Post) {
        return (await this.packMany([post]))[0]
    }

    async packMany(posts: Post[]) {
        return Promise.all(
            posts.map(async post => ({
                id: post.id,
                text: post.text,
                user: await getCustomRepository(UserRepository).pack(post.user),
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
