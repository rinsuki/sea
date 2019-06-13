import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ = require("transform-ts")
import { Post } from "../../../db/entities/post"
import { getRepository, getManager, Not, getCustomRepository } from "typeorm"
import { PostRepository } from "../../../db/repositories/post"
import { User } from "../../../db/entities/user"
import { publishRedisConnection } from "../../../utils/getRedisConnection"
import { PostAttachedFile } from "../../../db/entities/postAttachedFile"
import { AlbumFile } from "../../../db/entities/albumFile"
import { Subscription } from "../../../db/entities/subscription"
import webpush, { WebPushError } from "web-push"
import { WP_OPTIONS, S3_PUBLIC_URL } from "../../../config"
import { UserRepository } from "../../../db/repositories/user"

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
        const replies = new Set(post.text.match(repliesRegex))
        for (const reply of replies) {
            const target = await transactionalEntityManager.findOne(User, {
                screenName: reply.replace("@", ""),
            })
            if (target != null) {
                const subscriptions = await transactionalEntityManager.find(Subscription, {
                    user: target,
                    revokedAt: null,
                })
                for (const subscription of subscriptions) {
                    const subscriptionOptions = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.publicKey,
                            auth: subscription.authenticationSecret,
                        },
                    }
                    const icon = post.user.avatarFile
                        ? post.user.avatarFile.variants
                              .filter(variant => variant.type == "thumbnail")
                              .sort(variant => variant.score)[0]
                        : null
                    const payload = {
                        title: `${post.user.name} (@${post.user.screenName})`,
                        body: post.text,
                        icon: icon,
                    }
                    try {
                        await webpush.sendNotification(subscriptionOptions, JSON.stringify(payload), WP_OPTIONS)
                    } catch (error) {
                        if (error instanceof WebPushError) {
                            console.log(`failed: ${subscription.endpoint}`)
                            if (3 <= subscription.fallCount) {
                                await transactionalEntityManager.update(
                                    Subscription,
                                    { id: subscription.id },
                                    { revokedAt: new Date() }
                                )
                            } else {
                                await transactionalEntityManager.increment(
                                    Subscription,
                                    { id: subscription.id },
                                    "fallCount",
                                    1
                                )
                            }
                        } else {
                            console.error(error)
                        }
                    }
                }
            }
        }
    })
    publishRedisConnection.publish("timelines:public", post.id.toString())
    console.log(post.files)
    await ctx.send(PostRepository, post)
})

export default router
