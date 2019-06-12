import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from ".."
import koaBody = require("koa-body")
import { checkCsrf } from "../../../utils/checkCsrf"
import { getRepository } from "typeorm"
import { InviteCode } from "../../../db/entities/inviteCode"
import $ from "transform-ts"
import { $length } from "../../../utils/transformers"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.render("settings/invite_codes/index")
})

router.get("/new", async ctx => {
    const codes = await getRepository(InviteCode)
        .createQueryBuilder("invite_codes")
        .where("invite_codes.fromUser = :me_id", {
            me_id: ctx.state.session!.user.id,
        })
        .leftJoinAndSelect("invite_codes.toUser", "users")
        .orderBy("invite_codes.createdAt", "ASC")
        .getMany()
    ctx.render("settings/invite_codes/new", { codes })
})

router.post("/new", koaBody(), checkCsrf, async ctx => {
    const user = ctx.state.session!.user
    if (user.canMakeInviteCode == false) return ctx.throw(400, "お前は権限がない")
    const { memo } = $.obj({ memo: $.string.compose($length({ max: 64 })) }).transformOrThrow(ctx.request.body)
    const code = new InviteCode()
    code.fromUser = user
    code.generateCode()
    code.memo = memo
    await getRepository(InviteCode).save(code)
    const codes = await getRepository(InviteCode)
        .createQueryBuilder("invite_codes")
        .where("invite_codes.fromUser = :me_id", {
            me_id: ctx.state.session!.user.id,
        })
        .leftJoinAndSelect("invite_codes.toUser", "users")
        .orderBy("invite_codes.createdAt", "ASC")
        .getMany()
    ctx.render("settings/invite_codes/new", {
        codes,
        createdCode: code,
    })
})

export default router
