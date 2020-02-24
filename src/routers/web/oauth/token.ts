import Router from "@koa/router"
import $ from "transform-ts"
import koaBody = require("koa-body")
import { getRepository, getManager, getCustomRepository } from "typeorm"
import { Application } from "../../../db/entities/application"
import { AuthorizationCode } from "../../../db/entities/authorizationCode"
import { AccessToken } from "../../../db/entities/accessToken"
import { $literal } from "../../../utils/transformers"
import { UserRepository } from "../../../db/repositories/user"
import { WebRouterState, WebRouterCustom } from "../"
const router = new Router<WebRouterState, WebRouterCustom>()

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
        include_user_object: $.optional($.literal("v1")),
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
        { relations: ["user", "user.avatarFile"] }
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
    var user
    if (body.include_user_object === "v1") user = await getCustomRepository(UserRepository).pack(code.user)
    ctx.body = {
        access_token: token.token,
        token_type: "Bearer",
        user,
    }
})

export default router
