import { APIRouter } from "../router-class"
import { getRepository } from "typeorm"
import { Post } from "../../../db/entities/post"
import { PostRepository } from "../../../db/repositories/post"
import $ from "cafy"

const router = new APIRouter()

router.get("/public", async ctx => {
    const queryBefore = $.obj({
        sinceId: $.str.match(/^[0-9]+$/).makeOptional(),
        count: $.str.match(/^[0-9]+$/).makeOptional(),
    }).throw(ctx.query)
    const query = $.obj({
        count: $.num
            .int()
            .range(1, 100)
            .makeOptional(),
        sinceId: $.num.makeOptional(),
    }).throw({
        count:
            queryBefore.count == null ? undefined : parseInt(queryBefore.count),
        sinceId:
            queryBefore.sinceId == null
                ? undefined
                : parseInt(queryBefore.sinceId),
    })
    var fetch = getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "users")
        .leftJoinAndSelect("post.application", "applications")
        .limit(query.count || 20)
        .orderBy("post.createdAt", "DESC")
    if (query.sinceId)
        fetch = fetch.andWhere("post.id > :sinceId", { sinceId: query.sinceId })
    await ctx.sendMany(PostRepository, await fetch.getMany())
})

export default router
