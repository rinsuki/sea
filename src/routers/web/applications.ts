import Router = require("koa-router")
import { WebRouterState, WebRouterCustom } from "."
import { getRepository, Not, IsNull } from "typeorm"
import { Application } from "../../db/entities/application"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const apps = await getRepository(Application).find({
        where: {
            isPublic: true,
            url: Not(IsNull),
        },
        relations: ["ownerUser"],
    })
    ctx.render("applications", { apps })
})

export default router
