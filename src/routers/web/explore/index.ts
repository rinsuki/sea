import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from ".."
import rankingRouter from "./ranking"
import statsRouter from "./stats"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("explore/index")
})

router.use("/ranking", rankingRouter.routes())
router.use("/stats", statsRouter.routes())

export default router
