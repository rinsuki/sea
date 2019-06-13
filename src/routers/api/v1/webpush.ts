import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ = require("transform-ts")
import { $length } from "../../../utils/transformers"
import { getRepository, getCustomRepository } from "typeorm"
import { Subscription } from "../../../db/entities/subscription"
import { WP_OPTIONS } from "../../../config"
import { SubscriptionRepository } from "../../../db/repositories/subscription"

const router = new APIRouter()

router.get("/server_key", async ctx => {
    ctx.type = "json"
    ctx.body = JSON.stringify({
        applicationServerKey: WP_OPTIONS.vapidDetails!.publicKey,
    })
})

router.get("/subscriptions", async ctx => {
    const subscriptions = await getRepository(Subscription).find({
        user: ctx.state.token.user,
        application: ctx.state.token.application,
        revokedAt: null,
    })
    ctx.sendMany(SubscriptionRepository, subscriptions)
})

router.post("/subscriptions", koaBody(), async ctx => {
    const body = $.obj({
        endpoint: $.string.compose($length({ min: 1 })),
        keys: $.obj({
            p256dh: $.string.compose($length({ min: 1 })),
            auth: $.string.compose($length({ min: 1 })),
        }),
        description: $.optional($.string),
    }).transformOrThrow(ctx.request.body)
    const subscription = new Subscription()
    subscription.user = ctx.state.token.user
    subscription.application = ctx.state.token.application
    subscription.endpoint = body.endpoint
    subscription.publicKey = body.keys.p256dh
    subscription.authenticationSecret = body.keys.auth
    if (body.description != null) subscription.description = body.description
    await getRepository(Subscription).save(subscription)
    await ctx.send(SubscriptionRepository, subscription)
})

export default router
