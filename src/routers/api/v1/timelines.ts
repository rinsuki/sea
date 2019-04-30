import { APIRouter } from "../router-class"
import { getRepository } from "typeorm"
import { Post } from "../../../db/entities/post"
import { PostRepository } from "../../../db/repositories/post"
import $ from "cafy"

const router = new APIRouter()

router.get("/public", async ctx => {
    const queryBefore = $.obj({
        count: $.str.match(/^[0-9]+$/).makeOptional(),
    }).throw(ctx.query)
    const query = $.obj({
        count: $.num
            .int()
            .range(1, 100)
            .makeOptional(),
    }).throw({
        count:
            queryBefore.count == null ? undefined : parseInt(queryBefore.count),
    })
    await ctx.sendMany(
        PostRepository,
        await getRepository(Post)
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "users")
            .leftJoinAndSelect("post.application", "applications")
            .limit(query.count || 20)
            .orderBy("post.createdAt", "DESC")
            .getMany()
    )
})

export default router
