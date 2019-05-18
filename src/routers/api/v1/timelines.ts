import { APIRouter } from "../router-class"
import { getRepository } from "typeorm"
import { Post } from "../../../db/entities/post"
import { PostRepository } from "../../../db/repositories/post"
import $ from "cafy"
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"

const router = new APIRouter()

router.get("/public", async ctx => {
    const queryBefore = $.obj({
        sinceId: $.str.match(/^[0-9]+$/).makeOptional(),
        maxId: $.str.match(/^[0-9]+$/).makeOptional(),
        count: $.str.match(/^[0-9]+$/).makeOptional(),
    }).throw(ctx.query)
    const query = $.obj({
        count: $.num
            .int()
            .range(1, 100)
            .makeOptional(),
        sinceId: $.num.makeOptional(),
        maxId: $.num.makeOptional(),
    }).throw({
        count: queryBefore.count == null ? undefined : parseInt(queryBefore.count),
        sinceId: queryBefore.sinceId == null ? undefined : parseInt(queryBefore.sinceId),
    })
    var fetch = getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "users")
        .leftJoinAndSelect("users.avatarFile", "avatar_file")
        .leftJoinAndSelect("post.application", "applications")
        .limit(query.count || 20)
        .orderBy("post.createdAt", "DESC")
        .where("post.createdAt > :minReadableDate", { minReadableDate: ctx.state.token.user.minReadableDate })
    if (query.sinceId) fetch = fetch.andWhere("post.id > :sinceId", { sinceId: query.sinceId })
    if (query.maxId) fetch = fetch.andWhere("post.id < :maxId", { maxId: query.maxId })
    const result = await fetch.getMany()
    await ctx.sendMany(PostRepository, result)
})

export default router
