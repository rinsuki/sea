import Router from "koa-router"
import koaBody from "koa-body"
import { checkReCaptcha } from "../../utils/checkReCaptcha"
import { getRepository } from "typeorm"
import { User } from "../../db/entities/user"
import bcrypt from "bcrypt"
import { createUserSession } from "../../utils/createUserSession"
import $ from "transform-ts"
import { UserSession } from "../../db/entities/userSession"
import { WebRouterState, WebRouterCustom } from "."
import { $regexp, $length } from "../../utils/transformers"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("login")
})

router.post("/", koaBody(), checkReCaptcha, async ctx => {
    const body = $.obj({
        screen_name: $.string.compose($length({ min: 1, max: 20 })).compose($regexp(/^[0-9A-Za-z_]+$/)),
        password: $.string.compose($length({ min: 8 })),
    }).transformOrThrow(ctx.request.body)
    const user = await getRepository(User).findOne({
        screenName: body.screen_name,
    })
    if (user == null) return ctx.throw(400, "そんなユーザーいない")
    const checkPasswordResult = await bcrypt.compare(body.password, user.encryptedPassword)
    if (!checkPasswordResult) return ctx.throw(400, "パスワードが違う")
    await createUserSession(ctx, user)
    ctx.redirect("/")
})

export default router
