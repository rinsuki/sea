import Router = require("@koa/router")
import { WebRouterState, WebRouterCustom } from "."
import { getRepository, Not, IsNull } from "typeorm"
import { Application } from "../../db/entities/application"
import { User } from "../../db/entities/user"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const apps = await getRepository(Application)
        .createQueryBuilder("apps")
        .leftJoinAndSelect("apps.ownerUser", "users")
        .where("apps.isPublic = true")
        .andWhere("apps.url IS NOT NULL")
        .orderBy("RANDOM()")
        .getMany()
    ctx.render("applications", { apps })
})

export default router
