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
        count: $.str.match(/^[0-9]+$/).makeOptional(),
    }).throw(ctx.query)
    const query = $.obj({
        count: $.num
            .int()
            .range(1, 100)
            .makeOptional(),
        sinceId: $.num.makeOptional(),
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
    if (query.sinceId) fetch = fetch.andWhere("post.id > :sinceId", { sinceId: query.sinceId })
    const result = await fetch.getMany()
    var files = result.length // IN (:...hoge) に 無を渡すとsyntax errorが発生するので回避する
        ? await getRepository(PostAttachedFile)
              .createQueryBuilder("attached_files")
              .leftJoinAndSelect("attached_files.albumFile", "album_files")
              .leftJoinAndSelect("album_files.variants", "variants")
              .where("attached_files.post_id IN (:...post_ids)", {
                  post_ids: result.map(p => p.id),
              })
              .getMany()
        : []
    await ctx.sendMany(
        PostRepository,
        result.map(post => {
            post.files = files.filter(f => f.postId === post.id)
            return post
        })
    )
})

export default router
