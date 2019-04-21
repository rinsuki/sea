import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from "."
import koaBody = require("koa-body")
import { checkCsrf } from "../../utils/checkCsrf"
import { getRepository } from "typeorm"
import { UserSession } from "../../db/entities/userSession"
import { SESSION_COOKIE_NAME } from "../../constants"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("logout")
})

router.post("/", koaBody(), checkCsrf, async ctx => {
    const session = ctx.state.session!
    await getRepository(UserSession).update(
        {
            disabledAt: "NOW()",
        },
        {
            id: session.id,
        }
    )
    ctx.cookies.set(SESSION_COOKIE_NAME)
    ctx.redirect("/")
})

export default router
