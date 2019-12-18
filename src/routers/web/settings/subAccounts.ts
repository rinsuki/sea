import Router = require("koa-router")
import { WebRouterState, WebRouterCustom } from ".."
import { getRepository } from "typeorm"
import { User } from "../../../db/entities/user"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const session = ctx.state.session
    if (session == null) throw "please login"
    const subAccounts = await getRepository(User).find({
        owner: session.user,
    })
    ctx.render("settings/sub_accounts/index", { subAccounts })
})

export default router
