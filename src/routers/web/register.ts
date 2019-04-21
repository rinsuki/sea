import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from "."
import { createUserSession } from "../../utils/createUserSession"
import { getRepository } from "typeorm"
import { User } from "../../db/entities/user"
import $ from "cafy"
import koaBody = require("koa-body")
import { checkReCaptcha } from "../../utils/checkReCaptcha"
import bcrypt from "bcrypt"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("register")
})

router.post("/", koaBody(), checkReCaptcha, async ctx => {
    const body = $.obj({
        name: $.str.min(1).max(20),
        screen_name: $.str
            .min(1)
            .max(20)
            .match(/^[0-9A-Za-z_]+$/),
        password: $.str.min(8),
    })
        .strict()
        .throw(ctx.request.body)
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
