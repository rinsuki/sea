import { AccessToken } from "../../db/entities/accessToken"
import { getRepository, getCustomRepository } from "typeorm"
import v1Router from "./v1"
import { APIRouter } from "./router-class"
import { HttpError } from "http-errors"

const router = new APIRouter()

router.use(async (ctx, next) => {
    if (ctx.request.headers["origin"] != null) {
        ctx.set("Access-Control-Allow-Origin", "*")
    }

    await next()
})

router.use(async (ctx, next) => {
    try {
        await next()
    } catch (e) {
        // https://github.com/jshttp/http-errors/issues/56#issuecomment-481969593
        if (e.constructor && e.constructor.super_ && e.constructor.super_.name === "HttpError") {
            ctx.status = e.statusCode
            ctx.body = {
                errors: [
                    {
                        message: e.message,
                    },
                ],
            }
            console.log(ctx.body)
            return
        }
        ctx.status = 503
        ctx.body = {
            errors: [
                {
                    message: "Internal Server Error",
                },
            ],
        }
        console.error(e)
    }
})

router.options("(.*)", async ctx => {
    ctx.status = 204
    ctx.set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, PATCH")
    ctx.set("Access-Control-Allow-Headers", "Authorization, Content-Type")
    ctx.set("Access-Control-Max-Age", (24 * 60 * 60).toString())
})

router.use(async (ctx, next) => {
    const tokenString = ctx.request.headers.authorization as string | undefined
    if (tokenString == null) throw ctx.throw(400, "Please authorize")
    const tokenSearchResult = /^(.+?) (.+)$/.exec(tokenString)
    if (tokenSearchResult == null) throw ctx.throw(400, "Invalid authorize format")
    if (tokenSearchResult[1] !== "Bearer") throw ctx.throw(400, "Authorize type is invalid")
    const token = await getRepository(AccessToken).findOne(
        {
            token: tokenSearchResult[2],
        },
        {
            relations: ["user", "user.inviteCode", "user.avatarFile", "application"],
        }
    )
    if (token == null) throw ctx.throw(400, "Authorize failed")
    if (token.revokedAt != null) throw ctx.throw(403, "This token is already revoked")
    if (token.user.inviteCode == null) throw ctx.throw(400, "Please check web interface")
    // TODO: 凍結されてたらここで蹴る
    ctx.state = {
        token,
    }
    await next()
})

router.use(async (ctx, next) => {
    ctx.send = async (repo, input) => {
        ctx.body = JSON.stringify(await getCustomRepository(repo).pack(input, ctx.state.token))
        ctx.type = "json"
    }
    ctx.sendMany = async (repo, input) => {
        ctx.body = JSON.stringify(await getCustomRepository(repo).packMany(input, ctx.state.token))
        ctx.type = "json"
    }
    await next()
})

router.use("/v1", v1Router.routes())

export default router
