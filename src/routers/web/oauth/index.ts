import Router from "@koa/router"
import { WebRouterState, WebRouterCustom } from ".."
import authorizeRouter from "./authorize"

const router = new Router<WebRouterState, WebRouterCustom>()

router.use("/authorize", authorizeRouter.routes())

export default router
