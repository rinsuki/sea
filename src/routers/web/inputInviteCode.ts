import Router from "koa-router"
import { WebRouterState, WebRouterCustom } from "."
import { getRepository, getManager } from "typeorm"
import { User } from "../../db/entities/user"
import { checkCsrf } from "../../utils/checkCsrf"
import $ = require("transform-ts")
import { InviteCode } from "../../db/entities/inviteCode"
import { createHash } from "crypto"
import koaBody = require("koa-body")
import { UrlSafeBase64 } from "../../utils/urlSafeBase64"
import { $length } from "../../utils/transformers"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const firstUser = await getRepository(User).findOneOrFail({
        order: {
            id: "ASC",
        },
    })
    console.log(firstUser)
    ctx.render("input_invite_code", {
        isFirstUserMode: firstUser.id === ctx.state.session!.user.id,
    })
})

router.post("/", koaBody(), checkCsrf, async ctx => {
    const { code } = $.obj({ code: $.string.compose($length(16)) }).transformOrThrow(ctx.request.body)
    const user = ctx.state.session!.user
    if (user.inviteCode != null) return ctx.throw(400, "お前もう招待されただろ")
    if (code === "sp!!!!first_user") {
        // 最初の登録者
        const firstUser = await getRepository(User).findOneOrFail({
            order: {
                id: "ASC",
            },
        })
        if (firstUser.id !== ctx.state.session!.user.id) {
            return ctx.throw(400, "お前最初の登録者じゃねえだろゴラ")
        }
        const inviteCode = new InviteCode()
        inviteCode.fromUser = firstUser
        inviteCode.toUser = firstUser
        inviteCode.code = "sp!!!!first_user"
        inviteCode.memo = "招待ツリーのルート"
        await getRepository(InviteCode).save(inviteCode)
        firstUser.inviteCode = inviteCode
        firstUser.canMakeInviteCode = true
        firstUser.minReadableDate = new Date("1970-01-01")
        await getRepository(User).save(firstUser)
    } else {
        // 2人目以降: 普通の確認
        const inviteCode = await getRepository(InviteCode).findOne({
            code,
            toUser: null,
        })
        if (inviteCode == null) {
            return ctx.throw(400, "指定された招待コードが見つかりませんでした")
        }
        await getManager().transaction(async manager => {
            inviteCode.toUser = user
            await manager.getRepository(InviteCode).save(inviteCode)
            user.inviteCode = inviteCode
            user.minReadableDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            await manager.getRepository(User).save(user)
        })
    }
    // リダイレクトパラメータ検証
    try {
        if (ctx.request.query.back == null) return ctx.redirect("/")
        const { back: backUrl, r: randomizer, s } = $.obj({
            back: $.string,
            r: $.string.compose($length(16)),
            s: $.string.compose($length(43)),
        }).transformOrThrow(ctx.request.query)
        console.log(ctx.request.query)
        const seed = createHash("sha512")
            .update(randomizer)
            .update(ctx.state.session!.secret)
            .digest("hex")
        const signature = createHash("sha256")
            .update(backUrl)
            .update(seed)
            .digest("base64")
        console.log(signature)
        if (UrlSafeBase64.revert(s) !== signature) throw "humm"
        ctx.redirect(backUrl)
    } catch (e) {
        console.error(e)
        ctx.redirect("/?error=failed_to_verify_redirect_params")
    }
})

export default router
