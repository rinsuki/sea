import Router = require("@koa/router")
import { WebRouterState, WebRouterCustom } from "."
import {
    getRepository,
    MoreThan,
    getCustomRepository,
    FindManyOptions,
    FindConditions,
    MoreThanOrEqual,
    LessThanOrEqual,
    In,
} from "typeorm"
import { Post } from "../../db/entities/post"
import { PostRepository } from "../../db/repositories/post"
import { ParameterizedContext } from "koa"
import { RouterParamContext } from "@koa/router"
import { format, addHours } from "date-fns"
import ja from "date-fns/locale/ja"

const router = new Router<WebRouterState, WebRouterCustom>()

const callback = async (
    ctx: ParameterizedContext<WebRouterState, WebRouterCustom & RouterParamContext<WebRouterState, WebRouterCustom>>
) => {
    if (ctx.state.session == null) return ctx.throw(400, "ログインしてね")
    const cmd = ctx.params.cmd || ""
    if (cmd === "") {
        ctx.redirect("/posts/l50")
        return
    }

    var fetch = getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "users")
        .leftJoinAndSelect("users.avatarFile", "avatar_file")
        .leftJoinAndSelect("post.application", "applications")
        .where("post.createdAt > :minReadableDate", { minReadableDate: ctx.state.session.user.minReadableDate })
    var order: "ASC" | "DESC" = "ASC"
    var limit = 101

    // parse command

    var result

    if ((result = /^l([0-9]{1,3})|l1000$/.exec(cmd))) {
        limit = parseInt(result[1])
        order = "DESC"
    } else if ((result = /^([0-9]{1,8})?-([0-9]{1,8})?$/.exec(cmd))) {
        if (result[1] != null) {
            fetch = fetch.andWhere("post.id >= :startId", { startId: parseInt(result[1]) })
        }
        if (result[2] != null) {
            fetch = fetch.andWhere("post.id <= :endId", { endId: parseInt(result[2]) })
        }
        console.log(result)
    } else if ((result = /^[0-9]{1,8}$/.exec(cmd))) {
        fetch = fetch.andWhere("post.id = :id", { id: parseInt(result[0]) })
    } else {
        ctx.throw(400, "よくわからなかったです。。。")
        return
    }

    const posts = await getCustomRepository(PostRepository)
        .packMany(
            await fetch
                .limit(limit)
                .orderBy("post.id", order)
                .getMany()
        )
        .then(r => r.sort((a, b) => a.id - b.id))
    if (posts.length === 0) {
        ctx.throw(404, "内容がないよう。。。")
        return
    }

    const postIds = posts.map(p => p.id)

    const replies = await getRepository(Post)
        .find({
            where: { inReplyToId: In(postIds) },
            select: ["id", "inReplyToId"],
            order: { id: "ASC" },
        })
        .then(r =>
            r.map(rep => {
                ;(<any>rep).isFoundInPosts = postIds.includes(rep.id)
                return rep
            })
        )

    for (const post of posts) {
        ;(<any>post).createdAtString = format(post.createdAt, "yyyy/MM/dd(EEEEEE) HH:mm:ss.SSS", {
            locale: ja,
        })
        ;(<any>post).replies = replies.filter(p => p.inReplyToId === post.id)
    }
    ctx.render("posts", { posts, lastPost: posts[posts.length - 1] })
}

router.get("/", callback)
router.get("/:cmd", callback)

export default router
