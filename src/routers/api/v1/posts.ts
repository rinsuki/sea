import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ from "cafy"
import { Post } from "../../../db/entities/post"
import { getRepository, getManager } from "typeorm"
import { PostRepository } from "../../../db/repositories/post"
import { User } from "../../../db/entities/user"

const router = new APIRouter()

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        text: $.str,
    })
        .strict()
        .throw(ctx.request.body)
    const post = new Post()
    post.text = body.text
    post.application = ctx.state.token.application
    await getManager().transaction(
        "SERIALIZABLE",
        async transactionalEntityManager => {
            var user = ctx.state.token.user
            const res = await transactionalEntityManager.increment(
                User,
                { id: user.id },
                "postsCount",
                1
            )
            user = await transactionalEntityManager.findOneOrFail(User, user.id)
            post.user = user
            await getRepository(Post).save(post)
        }
    )
    await ctx.send(PostRepository, post)
})

export default router
