import { APIRouter } from "../router-class"
import { getRepository } from "typeorm"
import { Post } from "../../../db/entities/post"
import { PostRepository } from "../../../db/repositories/post"
import $ = require("transform-ts")
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"
import { $stringNumber, $safeNumber, $range } from "../../../utils/transformers"

const router = new APIRouter()

router.get("/public", async ctx => {
    const query = $.obj({
        sinceId: $.optional($stringNumber.compose($safeNumber)),
        maxId: $.optional($stringNumber.compose($safeNumber)),
        count: $.optional($stringNumber.compose($safeNumber).compose($range({ min: 1, max: 100 }))),
    }).transformOrThrow(ctx.query)
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
