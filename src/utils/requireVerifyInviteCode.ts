import { RouterContext } from "koa-router"
import { UserSession } from "../db/entities/userSession"
import { createHash, randomBytes } from "crypto"
import { UrlSafeBase64 } from "./urlSafeBase64"
import { URLSearchParams } from "url"

export function requireVerifyInviteCode<StateT extends { session?: UserSession }, CustomT>(
    ctx: RouterContext<StateT, CustomT>,
    next: () => Promise<void>
) {
    if (ctx.state.session && ctx.state.session.user.inviteCode == null) {
        const backUrl = ctx.URL.pathname + ctx.URL.search
        const randomizer = UrlSafeBase64.convert(randomBytes(12).toString("base64"))
        const seed = createHash("sha512")
            .update(randomizer)
            .update(ctx.state.session.secret)
            .digest("hex")
        const signature = createHash("sha256")
            .update(backUrl)
            .update(seed)
            .digest("base64")
        const params = new URLSearchParams([
            ["back", backUrl],
            ["r", randomizer],
            ["s", UrlSafeBase64.convert(signature)],
        ])
        console.log(signature)
        ctx.redirect("/input_invite_code?" + params.toString())
        return
    }
    return next()
}
