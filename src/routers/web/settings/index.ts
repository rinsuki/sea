import Router from "@koa/router"
import { WebRouterState, WebRouterCustom } from ".."
import myDevelopedApplicationsRouter from "./myDevelopedApplications"
import inviteCodesRouter from "./inviteCodes"
import customEmojisRouter from "./customEmojis"

const router = new Router<WebRouterState, WebRouterCustom>()

router.use("/my_developed_applications", myDevelopedApplicationsRouter.routes())
router.use("/invite_codes", inviteCodesRouter.routes())
router.use("/custom_emojis", customEmojisRouter.routes())

router.get("/", async ctx => {
    ctx.render("settings/index")
})

export default router
