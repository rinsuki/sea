import Router from "@koa/router"
import { WebRouterState, WebRouterCustom } from "."
import { createUserSession } from "../../utils/createUserSession"
import { getRepository } from "typeorm"
import { User } from "../../db/entities/user"
import $ from "transform-ts"
import koaBody = require("koa-body")
import { checkReCaptcha } from "../../utils/checkReCaptcha"
import bcrypt from "bcrypt"
import { $length, $regexp } from "../../utils/transformers"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("register")
})

router.post("/", koaBody(), checkReCaptcha, async ctx => {
    const body = $.obj({
        name: $.string.compose($length({ min: 1, max: 20 })),
        screen_name: $.string.compose($length({ min: 1, max: 20 })).compose($regexp(/^[0-9A-Za-z_]+$/)),
        password: $.string.compose($length({ min: 8 })),
    }).transformOrThrow(ctx.request.body)
    const user = new User()
    user.name = body.name
    user.screenName = body.screen_name
    user.encryptedPassword = await bcrypt.hash(body.password, 14)
    const repo = getRepository(User)
    const res = await repo.insert(user).catch(e => {
        if (e.name === "QueryFailedError") {
            if (e.constraint === "UQ:users:screen_name") {
                ctx.throw(400, "そのスクリーンネーム、もうすでに使われてますよ")
            }
        }
        throw e
    })
    await createUserSession(ctx, user)
    ctx.redirect("/")
})

export default router
