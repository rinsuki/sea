import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ from "cafy"
import { Post } from "../../../db/entities/post"
import { getRepository, getManager } from "typeorm"
import { PostRepository } from "../../../db/repositories/post"
import { User } from "../../../db/entities/user"
import { publishRedisConnection } from "../../../utils/getRedisConnection"
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"
import { AlbumFile } from "../../../db/entities/albumFile"

const router = new APIRouter()

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        text: $.str,
        fileIds: $.arr($.num).makeOptional(),
    })
        .strict()
        .throw(ctx.request.body)
    const post = new Post()
    post.text = body.text
    post.application = ctx.state.token.application
    await getManager().transaction("SERIALIZABLE", async transactionalEntityManager => {
        var user = ctx.state.token.user
        const res = await transactionalEntityManager.increment(User, { id: user.id }, "postsCount", 1)
        user = await transactionalEntityManager.findOneOrFail(User, user.id)
        post.user = user
        await transactionalEntityManager.save(post)
        if (body.fileIds != null && body.fileIds.length) {
            // TODO: ここ 一個ごとforじゃなくて ORDER BY FIELDを使う
            const attachedFiles: PostAttachedFile[] = []
            for (const [index, fileId] of body.fileIds.entries()) {
                const file = await transactionalEntityManager.findOneOrFail(
                    AlbumFile,
                    {
                        id: fileId,
                        user: user,
                    },
                    {
                        relations: ["variants"],
                    }
                )
                const attachedFile = new PostAttachedFile()
                attachedFile.post = post
                attachedFile.albumFile = file
                attachedFile.order = index
                attachedFiles.push(attachedFile)
            }
            await transactionalEntityManager.insert(PostAttachedFile, attachedFiles)
            post.files = attachedFiles
        } else {
            post.files = []
        }
    })
    publishRedisConnection.publish("timelines:public", post.id.toString())
    console.log(post.files)
    await ctx.send(PostRepository, post)
})

export default router
