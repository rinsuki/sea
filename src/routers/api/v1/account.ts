import { APIRouter } from "../router-class"
import { UserRepository } from "../../../db/repositories/user"
import koaBody = require("koa-body")
import $ from "cafy"
import { getRepository } from "typeorm"
import { User } from "../../../db/entities/user"

const router = new APIRouter()

router.get("/", async ctx => {
    await ctx.send(UserRepository, ctx.state.token.user)
})
router.redirect("/verify_credentials", "/api/v1/account", 301)

router.patch("/", koaBody(), async ctx => {
    const body = $.obj({
        name: $.str
            .makeOptional()
            .min(1)
            .max(20),
    }).throw(ctx.request.body)

    const user = ctx.state.token.user
    if (body.name != null) user.name = body.name
    await getRepository(User).save(user)
    await ctx.send(UserRepository, user)
})

export default router
