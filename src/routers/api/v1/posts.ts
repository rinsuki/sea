import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ = require("transform-ts")
import { Post } from "../../../db/entities/post"
import { getManager, getRepository, getCustomRepository } from "typeorm"
import { PostRepository } from "../../../db/repositories/post"
import { User } from "../../../db/entities/user"
import { publishRedisConnection } from "../../../utils/getRedisConnection"
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"
import { AlbumFile } from "../../../db/entities/albumFile"
import { Subscription } from "../../../db/entities/subscription"
import webpush from "web-push"
import { WP_OPTIONS } from "../../../config"
import { AlbumFileRepository } from "../../../db/repositories/albumFile"
import { ApplicationRepository } from "../../../db/repositories/application"

const router = new APIRouter()

const repliesRegex = new RegExp(/(@[A-Za-z0-9]+)[^A-Za-z0-9]*?/g)

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        text: $.string,
        fileIds: $.optional($.array($.number)),
    }).transformOrThrow(ctx.request.body)
    const post = new Post()
    post.text = body.text
    post.application = ctx.state.token.application
    await getManager().transaction("SERIALIZABLE", async transactionalEntityManager => {
        var user = ctx.state.token.user
        const res = await transactionalEntityManager.increment(User, { id: user.id }, "postsCount", 1)
        user = await transactionalEntityManager.findOneOrFail(
            User,
            { id: user.id },
            { relations: ["avatarFile", "avatarFile.variants"] }
        )
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
    const now = new Date()
    const replies = Array.from(new Set(post.text.match(repliesRegex))).map(reply => reply.replace("@", ""))
    if (0 < replies.length) {
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
            .andWhere("users.screenName = ANY(:lusers)", { lusers: replies })
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
                return new Promise(async (res, rej) => {
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
                    res()
                })
            })
        )
    }
    await ctx.send(PostRepository, post)
})

export default router
