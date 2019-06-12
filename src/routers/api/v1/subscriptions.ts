import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ from "cafy"
import { getRepository } from "typeorm"
import { Subscription } from "../../../db/entities/subscription"
import { WP_OPTIONS } from "../../../config"

const router = new APIRouter()

router.get("/", koaBody(), async ctx => {
    ctx.type = "json"
    if (WP_OPTIONS) {
        ctx.body = JSON.stringify({ is_enabled: true, applicationServerKey: WP_OPTIONS.vapidDetails!.publicKey })
    } else {
        ctx.body = JSON.stringify({ is_enabled: false })
    }
})

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        endpoint: $.str.min(1),
        keys: $.obj({
            p256dh: $.str.min(1),
            auth: $.str.min(1),
        }),
    }).throw(ctx.request.body)
    const subscription = new Subscription()
    const user = ctx.state.token.user
    subscription.user = user
    subscription.endpoint = body.endpoint
    subscription.publicKey = body.keys.p256dh
    subscription.authenticationSecret = body.keys.auth
    await getRepository(Subscription).save(subscription)
    ctx.body = ""
})

export default router
