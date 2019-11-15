import Router from "koa-router"
import $ from "transform-ts"
import koaBody = require("koa-body")
import { getRepository, getManager } from "typeorm"
import { Application } from "../../../db/entities/application"
import { AuthorizationCode } from "../../../db/entities/authorizationCode"
import { AccessToken } from "../../../db/entities/accessToken"
import { $literal } from "../../../utils/transformers"
const router = new Router()

router.use((ctx, next) => {
    if (ctx.request.headers["origin"] != null) {
        ctx.set("Access-Control-Allow-Origin", "*")
        ctx.set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, PATCH")
        ctx.set("Access-Control-Allow-Headers", "Authorization")
        ctx.set("Access-Control-Max-Age", (24 * 60 * 60).toString())
    }

    return next()
})

const OAuthGrantType = {
    authorizationCode: "authorization_code",
} as const

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        client_id: $.string,
        client_secret: $.string,
        code: $.string,
        grant_type: $literal(OAuthGrantType),
        state: $.optional($.string),
    }).transformOrThrow(ctx.request.body)
    const application = await getRepository(Application).findOne({
        clientId: body.client_id,
        clientSecret: body.client_secret,
    })
    if (application == null)
        throw ctx.throw(400, {
            error: "invalid_client",
            error_description: "Failed to check client information",
        })
    const code = await getRepository(AuthorizationCode).findOne(
        {
            application,
            code: body.code,
            state: body.state || null,
        },
        { relations: ["user"] }
    )
    if (code == null || new Date().getTime() - code.createdAt.getTime() > 10 * 60 * 1000)
        throw ctx.throw(400, {
            error: "invalid_grant",
            error_description: "Failed to find authorization code information",
        })
    var token = await getRepository(AccessToken).findOne({
        user: code.user,
        application,
        revokedAt: null,
    })
    if (token == null) {
        token = new AccessToken()
        token.application = application
        token.user = code.user
        token.generateToken()
        await getRepository(AccessToken).save(token)
    }
    ctx.body = {
        access_token: token.token,
        token_type: "Bearer",
    }
})

export default router
