import Router from "koa-router"
import $ from "cafy"
import koaBody = require("koa-body")
import { getRepository, getManager } from "typeorm"
import { Application } from "../../../db/entities/application"
import { AuthorizationCode } from "../../../db/entities/authorizationCode"
import { AccessToken } from "../../../db/entities/accessToken"
const router = new Router()

router.post("/", koaBody(), async ctx => {
    const body = $.obj({
        client_id: $.str,
        client_secret: $.str,
        code: $.str,
        grant_type: $.str.match(/^authorization_code$/),
        state: $.str.makeOptional(),
    }).throw(ctx.request.body)
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
    if (
        code == null ||
        new Date().getTime() - code.createdAt.getTime() > 10 * 60 * 1000
    )
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
