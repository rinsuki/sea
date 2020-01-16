import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from "../../web"
import rankingRouter from "./ranking"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("explore/index")
})

router.use("/ranking", rankingRouter.routes())

export default router
