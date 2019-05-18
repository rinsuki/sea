import { EntityRepository, Repository, getCustomRepository, getRepository, In } from "typeorm"
import { Post } from "../entities/post"
import { UserRepository } from "./user"
import { ApplicationRepository } from "./application"
import { AlbumFileRepository } from "./albumFile"
import { onlyUnique } from "../../utils/onlyUnique"
import { AlbumFile } from "../entities/albumFile"
import { PostAttachedFile } from "../entities/postAttachedFile"

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
    async pack(post: Post) {
        return (await this.packMany([post]))[0]
    }

    async packMany(posts: Post[]) {
        if (posts.length === 0) return []
        const users = await getCustomRepository(UserRepository).packMany(onlyUnique(posts.map(p => p.user), "id"))
        const attachedFiles = await getRepository(PostAttachedFile).find({
            where: { postId: In(posts.map(p => p.id)) },
            relations: ["albumFile"],
        })

        const allFiles = await getCustomRepository(AlbumFileRepository).packMany(
            onlyUnique(attachedFiles.map(f => f.albumFile), "id")
        )
        return Promise.all(
            posts.map(async post => {
                const files = attachedFiles
                    .filter(f => f.postId === post.id)
                    .sort((a, b) => a.order - b.order)
                    .map(f => allFiles.find(ff => ff.id === f.albumFile.id)!)
                return {
                    id: post.id,
                    text: post.text,
                    user: users.find(u => u.id === post.user.id),
                    application: await getCustomRepository(ApplicationRepository).pack(post.application),
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    files,
                }
            })
        )
    }
}
