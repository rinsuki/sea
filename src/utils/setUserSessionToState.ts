import { RouterContext } from "koa-router"
import { getRepository } from "typeorm"
import { UserSession } from "../db/entities/userSession"
import { createHash } from "crypto"

export async function setUserSessionToState(
    ctx: RouterContext<any, { [key: string]: any }>,
    next: () => Promise<any>
) {
    await (async () => {
        const sessionString = (ctx.cookies.get("sea:user_session") || "").split(
            ":"
        )
        if (sessionString.length != 2) return
        if (!/^[1-9][0-9]*$/.test(sessionString[0])) return
        const session = await getRepository(UserSession).findOne(
            sessionString[0]
        )
        if (!session) return
        if (sessionString.join(":") != session.getCookieValue()) return
        if (session.disabledAt != null) return
        ctx.state.session = session
    })()
    return await next()
}
