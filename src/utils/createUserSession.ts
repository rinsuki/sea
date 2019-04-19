import { RouterContext } from "koa-router"
import { User } from "../db/entities/user"
import { UserSession } from "../db/entities/userSessions"
import { randomBytes, createHash } from "crypto"
import { getRepository } from "typeorm"
import { SESSION_COOKIE_NAME } from "../constants"

export async function createUserSession(
    ctx: RouterContext<any, { [key: string]: any }>,
    user: User
) {
    const session = new UserSession()

    session.secret = randomBytes(192).toString("base64")
    session.user = user
    session.userAgent = ctx.get("User-Agent")
    session.createdIpAddress = ctx.ip
    await getRepository(UserSession).insert(session)
    ctx.cookies.set(SESSION_COOKIE_NAME, session.getCookieValue())
    console.log(session)
    return session
}
