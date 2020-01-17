import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ from "transform-ts"
import { Post } from "../../../db/entities/post"
import { getManager, getRepository, getCustomRepository, MoreThan } from "typeorm"
import { PostRepository } from "../../../db/repositories/post"
import { User } from "../../../db/entities/user"
import { publishRedisConnection } from "../../../utils/getRedisConnection"
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"
import { AlbumFile, AlbumFileType } from "../../../db/entities/albumFile"
import { Subscription } from "../../../db/entities/subscription"
import webpush from "web-push"
import { WP_OPTIONS } from "../../../config"
import { AlbumFileRepository } from "../../../db/repositories/albumFile"
import { ApplicationRepository } from "../../../db/repositories/application"
import parse, { isMention } from "@linkage-community/bottlemail"
import { $stringNumber } from "../../../utils/transformers"

const router = new APIRouter()

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        text: $.string,
        fileIds: $.optional($.array($.number)),
        notify: $.optional($.literal("none", "send")),
        inReplyToId: $.optional($.number),
    }).transformOrThrow(ctx.request.body)
    const post = new Post()
    post.text = body.text
    post.application = ctx.state.token.application
    await getManager().transaction("SERIALIZABLE", async transactionalEntityManager => {
        var user = ctx.state.token.user
        const latestPost = await transactionalEntityManager.findOne(Post, { where: { user }, order: { createdAt: "DESC" } })

        // 重複検知
        if (
            latestPost &&
            Date.now() - latestPost.createdAt.getTime() < 60 * 1000 &&
            latestPost.text === body.text &&
            latestPost.inReplyToId == body.inReplyToId
        ) {
            var isDuplicated = true
            const attachedFiles = await transactionalEntityManager.find(PostAttachedFile, {
                where: { post: latestPost },
                order: { order: "ASC" },
                relations: ["albumFile"],
            })
            if (body.fileIds == null || body.fileIds.length === 0) {
                isDuplicated = attachedFiles.length === 0
            } else {
                for (const [i, file] of attachedFiles.entries()) {
                    if (file.albumFile.id !== body.fileIds[i]) {
                        isDuplicated = false
                        break
                    }
                }
            }
            if (isDuplicated) {
                ctx.throw(400, "already posted with same text (and attached files). please check timeline.")
                return
            }
        }

        // inReplyToIdの先があるかを確認
        if (body.inReplyToId != null) {
            const targetPost = await transactionalEntityManager.findOne(Post, { id: body.inReplyToId })
            if (targetPost == null) {
                ctx.throw(400, "target of inReplyToId is not found.")
                return
            }
            post.inReplyToId = targetPost.id
        }

        // 添付ファイル
        const attachedFiles: PostAttachedFile[] = []
        if (body.fileIds != null && body.fileIds.length) {
            // TODO: ここ 一個ごとforじゃなくて ORDER BY FIELDを使う
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
            if (attachedFiles.length > 1 && attachedFiles.find(f => f.albumFile.type === AlbumFileType.VIDEO)) {
                throw "If attached video, attached files is should only one."
            }
        }

        // 投稿処理
        const res = await transactionalEntityManager.increment(User, { id: user.id }, "postsCount", 1)
        user = await transactionalEntityManager.findOneOrFail(User, { id: user.id }, { relations: ["avatarFile"] })
        post.user = user
        await transactionalEntityManager.save(post)
        if (attachedFiles.length > 0) {
            await transactionalEntityManager.insert(PostAttachedFile, attachedFiles)
            post.files = attachedFiles
        } else {
            post.files = []
        }
    })
    publishRedisConnection.publish("timelines:public", post.id.toString())
    console.log(post.files)
    const notify = body.notify || (post.application.isAutomated ? "none" : "send")
    if (notify === "send") {
        const now = new Date()
        const mentions = parse(post.text)
            .filter(isMention)
            .map(n => n.value)
        if (0 < mentions.length) {
            const icon: string | null = await (async () => {
                if (post.user.avatarFile) {
                    const albumFile = await getCustomRepository(AlbumFileRepository).pack(post.user.avatarFile)
                    return albumFile.variants
                        .filter(variant => variant.type == "thumbnail")
                        .sort(variant => variant.score)
                        .reverse()[0].url
                } else {
                    return null
                }
            })()
            const subscriptions = await getRepository(Subscription)
                .createQueryBuilder("subscription")
                .where("subscription.revokedAt IS NULL")
                .innerJoin("subscription.user", "users")
                .andWhere("users.screenName = ANY(:lusers)", { lusers: mentions })
                .getMany()
            const payload = {
                post: {
                    user: {
                        id: post.user.id,
                        name: post.user.name,
                        screenName: post.user.screenName,
                        icon: icon,
                    },
                    text: post.text,
                    id: post.id,
                    application: await getCustomRepository(ApplicationRepository).pack(post.application),
                },
                type: "mention",
            }
            Promise.all(
                subscriptions.map(async subscription => {
                    const subscriptionOptions = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.publicKey,
                            auth: subscription.authenticationSecret,
                        },
                    }
                    try {
                        await webpush.sendNotification(subscriptionOptions, JSON.stringify(payload), WP_OPTIONS)
                        if (subscription.failedAt != null) {
                            await getRepository(Subscription).update({ id: subscription.id }, { failedAt: null })
                        }
                    } catch (error) {
                        console.log(`failed: ${subscription.endpoint}`)
                        if (subscription.failedAt != null) {
                            if (604800000 <= now.getTime() - subscription.failedAt.getTime()) {
                                // 1000*60*60*24*7 = a week
                                await getRepository(Subscription).update({ id: subscription.id }, { revokedAt: now })
                            }
                        } else {
                            await getRepository(Subscription).update({ id: subscription.id }, { failedAt: now })
                        }
                    }
                    return
                })
            )
        }
    }
    await ctx.send(PostRepository, post)
})

router.get("/:id", async ctx => {
    const { id } = $.obj({ id: $stringNumber }).transformOrThrow(ctx.params)
    const post = await getRepository(Post).findOne(
        {
            id,
            createdAt: MoreThan(ctx.state.token.user.minReadableDate),
        },
        {
            relations: ["user", "application"],
        }
    )
    if (post == null) return ctx.throw(404, "post not found")
    await ctx.send(PostRepository, post)
})

export default router
