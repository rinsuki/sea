import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from "../../web"
import { getRepository } from "typeorm"
import { Application } from "../../../db/entities/application"
import $ from "transform-ts"
import { randomBytes } from "crypto"
import koaBody = require("koa-body")
import { checkCsrf } from "../../../utils/checkCsrf"
import { $length, $regexp, $stringNumber, $safeNumber, $literal } from "../../../utils/transformers"
import { AccessToken } from "../../../db/entities/accessToken"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const session = ctx.state.session
    if (session == null) throw "please login"
    const myOwnedApps = await getRepository(Application).find({
        ownerUser: session.user,
    })
    ctx.render("settings/my_developed_applications/index", { myOwnedApps })
})

router.get("/new", async ctx => {
    ctx.render("settings/my_developed_applications/new")
})

router.post("/new", koaBody(), checkCsrf, async ctx => {
    const session = ctx.state.session
    if (session == null) throw "please login"

    const body = $.obj({
        name: $.string.compose($length({ min: 1, max: 32 })),
        description: $.string.compose($length({ min: 1 })),
        redirect_uri: $.string,
    }).transformOrThrow(ctx.request.body)
    const app = new Application()
    app.name = body.name
    app.description = body.description
    app.redirectUri = body.redirect_uri
    app.clientId = randomBytes(32).toString("hex")
    app.clientSecret = randomBytes(32).toString("hex")
    app.ownerUser = session.user
    await getRepository(Application).save(app)
    ctx.redirect("/settings/my_developed_applications/" + app.id)
})

router.get("/:id", async ctx => {
    const { id } = $.obj({
        id: $stringNumber.compose($safeNumber),
    }).transformOrThrow(ctx.params)
    const app = await getRepository(Application).findOneOrFail(id, {
        relations: ["ownerUser"],
    })
    if (app.ownerUser.id != ctx.state.session!.user.id) return ctx.throw(403, "お前ownerじゃねえだろ")
    const token = await getRepository(AccessToken).findOne({
        user: app.ownerUser,
        application: app,
        revokedAt: null,
    })
    ctx.render("settings/my_developed_applications/show", { app, token })
})

router.post("/:id", koaBody(), checkCsrf, async ctx => {
    const { id } = $.obj({
        id: $stringNumber.compose($safeNumber),
    }).transformOrThrow(ctx.params)
    const body = $.obj({
        name: $.string.compose($length({ min: 1, max: 32 })),
        description: $.string.compose($length({ min: 1 })),
        redirect_uri: $.string,
        url: $.string,
        is_automated: $.optional($literal({ true: "1" })),
        is_public: $.optional($literal({ true: "1" })),
    }).transformOrThrow(ctx.request.body)
    const app = await getRepository(Application).findOneOrFail(id, {
        relations: ["ownerUser"],
    })
    if (app.ownerUser.id != ctx.state.session!.user.id) return ctx.throw(403, "お前ownerじゃねえだろ")
    if (body.url !== "" && !body.url.startsWith("http")) return ctx.throw(400, "URLを入れろURLを")
    app.name = body.name
    app.description = body.description
    app.redirectUri = body.redirect_uri
    app.url = body.url === "" ? null : body.url
    app.isAutomated = body.is_automated != undefined
    app.isPublic = body.is_public != undefined
    await getRepository(Application).save(app)
    ctx.redirect("/settings/my_developed_applications/" + app.id)
})

router.post("/:id/my_token", koaBody(), checkCsrf, async ctx => {
    const { id } = $.obj({
        id: $stringNumber.compose($safeNumber),
    }).transformOrThrow(ctx.params)

    const application = await getRepository(Application).findOneOrFail(id, {
        relations: ["ownerUser"],
    })
    if (application.ownerUser.id != ctx.state.session!.user.id) return ctx.throw(403, "お前ownerじゃねえだろ")

    var token = await getRepository(AccessToken).findOne({
        user: application.ownerUser,
        application,
        revokedAt: null,
    })
    if (token == null) {
        token = new AccessToken()
        token.application = application
        token.user = application.ownerUser
        token.generateToken()
        await getRepository(AccessToken).save(token)
    }

    ctx.status = 303
    ctx.set("Location", "/settings/my_developed_applications/" + id)
})

export default router
