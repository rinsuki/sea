import { RouterContext } from "koa-router"
import { UserSession } from "../db/entities/userSession"
import $ from "transform-ts"

export async function checkCsrf<StateT extends { session?: unknown }, CustomT>(
    ctx: RouterContext<StateT, CustomT>,
    next: () => Promise<void>
) {
    const body = $.obj({
        _csrf: $.string,
    }).transformOrThrow(ctx.request.body)
    const bodyToken = body._csrf
    delete ctx.request.body._csrf

    const session = ctx.state.session as unknown
    if (ctx.state.session == null) ctx.throw(403, "Please login")
    if (!(session instanceof UserSession)) throw new Error("ctx.state.sessionがUserSessionでない")
    const exceptedValue = session.getCookieValue()
    if (exceptedValue !== bodyToken) ctx.throw(400, "csrf token is invalid")
    await next()
}
