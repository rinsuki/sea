import { AccessToken } from "../../db/entities/accessToken"
import { getRepository } from "typeorm"
import v1Router from "./v1"
import { APIRouter } from "./router-class"

const router = new APIRouter()

router.use(async (ctx, next) => {
    const tokenString = ctx.request.headers.authorization as string | undefined
    if (tokenString == null) throw ctx.throw(400, "Please authorize")
    const tokenSearchResult = /^(.+?) (.+)$/.exec(tokenString)
    if (tokenSearchResult == null)
        throw ctx.throw(400, "Invalid authorize format")
    if (tokenSearchResult[1] !== "Bearer")
        throw ctx.throw(400, "Authorize type is invalid")
    const token = await getRepository(AccessToken).findOne(
        {
            token: tokenSearchResult[2],
        },
        {
            relations: ["user", "application"],
        }
    )
    if (token == null) throw ctx.throw(400, "Authorize failed")
    if (token.revokedAt != null)
        throw ctx.throw(403, "This token is already revoked")
    // TODO: 凍結されてたらここで蹴る
    ctx.state = {
        token,
    }
    await next()
})

router.options("*", async ctx => {
    ctx.status = 204
})

router.use("/v1", v1Router.routes())

export default router
