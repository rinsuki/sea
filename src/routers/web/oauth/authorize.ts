import Router from "@koa/router"
import { WebRouterState, WebRouterCustom } from ".."
import $ from "transform-ts"
import { getRepository } from "typeorm"
import { Application } from "../../../db/entities/application"
import { createHash } from "crypto"
import { checkCsrf } from "../../../utils/checkCsrf"
import koaBody = require("koa-body")
import { AuthorizationCode } from "../../../db/entities/authorizationCode"
import { URL } from "url"
import { $regexp, $literal } from "../../../utils/transformers"

const router = new Router<WebRouterState, WebRouterCustom>()

const OAuthResponseType = {
    code: "code",
} as const

router.get("/", async ctx => {
    const query = $.obj({
        client_id: $.string,
        response_type: $literal(OAuthResponseType),
        state: $.optional($.string),
    }).transformOrThrow(ctx.query)
    const app = await getRepository(Application).findOneOrFail({
        clientId: query.client_id,
    })
    const sign = createHash("sha512")
        .update(
            [ctx.state.session!.secret, app.clientId, query.response_type, query.state || ""]
                .map(s =>
                    createHash("sha256")
                        .update(s)
                        .digest("hex")
                )
                .join(":")
        )
        .digest("hex")
    ctx.render("oauth/authorize/index", {
        app,
        query,
        sign,
    })
})

router.post("/", koaBody(), checkCsrf, async ctx => {
    const query = $.obj({
        client_id: $.string,
        response_type: $literal(OAuthResponseType),
        state: $.optional($.string),
    }).transformOrThrow(ctx.query)
    const body = $.obj({
        sign: $.string,
    }).transformOrThrow(ctx.request.body)

    const app = await getRepository(Application).findOneOrFail({
        clientId: query.client_id,
    })
    const sign = createHash("sha512")
        .update(
            [ctx.state.session!.secret, app.clientId, query.response_type, query.state || ""]
                .map(s =>
                    createHash("sha256")
                        .update(s)
                        .digest("hex")
                )
                .join(":")
        )
        .digest("hex")
    if (sign !== body.sign) {
        ctx.throw(400, "invalid sign")
    }
    if (query.response_type === "code") {
        const code = new AuthorizationCode()
        code.application = app
        code.user = ctx.state.session!.user
        code.state = query.state || null
        code.generateCode()
        await getRepository(AuthorizationCode).save(code)
        if (app.redirectUri.length === 0) {
            ctx.render("oauth/authorize/code", {
                code: code.code,
            })
        } else {
            const url = new URL(app.redirectUri)
            url.searchParams.append("code", code.code)
            const state = code.state
            if (state != null) {
                url.searchParams.append("state", state)
            }
            ctx.redirect(url.toString())
        }
    } else {
    }
})

export default router
