import Router from "koa-router"
import pug from "pug"
import { User } from "../../db/entities/user"
import $ from "cafy"
import koaBody from "koa-body"
import bcrypt from "bcrypt"
import { isProductionMode, RECAPTCHA } from "../../config"
import { getRepository } from "typeorm"
import { join } from "path"
import fs from "fs"
import { createUserSession } from "../../utils/createUserSession"
import { setUserSessionToState } from "../../utils/setUserSessionToState"
import { checkReCaptcha } from "../../utils/checkReCaptcha"
import { checkCsrf } from "../../utils/checkCsrf"
import { UserSession } from "../../db/entities/userSessions"

const router = new Router<
    { session?: UserSession },
    { render: (name: string, locals?: {}) => void }
>()
const pugCompilerCache: { [key: string]: (locals: any) => string } = {}

const pugGlobalLocals = {
    recaptchaSiteKey: RECAPTCHA && RECAPTCHA.SITE_KEY,
}

const pugViewPath = join(__dirname, "..", "..", "..", "views")

function getCompiler(path: string) {
    const cache = pugCompilerCache[path]
    if (cache) {
        return cache
    }

    // WIP: このへんどうにかする
    var pugFile: string
    if (fs.existsSync(join(pugViewPath, path))) {
        if (path.endsWith(".pug")) {
            pugFile = path
        } else {
            pugFile = path + "/index.pug"
        }
    } else {
        pugFile = path + ".pug"
    }

    const compiler = pug.compileFile(join(pugViewPath, pugFile), {
        basedir: pugViewPath,
    })
    if (isProductionMode) {
        pugCompilerCache[path] = compiler
    }
    return compiler
}

router.use((ctx, next) => {
    ctx.render = (name: string, locals?: {}) => {
        const compiler = getCompiler(name)
        ctx.body = compiler({
            ...pugGlobalLocals,
            ...ctx.state,
            ...locals,
        })
        ctx.type = "text/html"
    }
    return next()
})

router.use(setUserSessionToState)

router.get("/", async ctx => {
    ctx.render("index")
})

router.get("/register", async ctx => {
    ctx.render("register")
})

router.post("/register", koaBody(), checkReCaptcha, async ctx => {
    const body = $.obj({
        name: $.str.min(1).max(20),
        screen_name: $.str
            .min(1)
            .max(20)
            .match(/^[0-9A-Za-z_]+$/),
        password: $.str.min(8),
        "g-recaptcha-response": $.str.makeOptional(),
    })
        .strict()
        .throw(ctx.request.body)
    const user = new User()
    user.name = body.name
    user.screenName = body.screen_name
    user.encryptedPassword = await bcrypt.hash(body.password, 14)
    const repo = getRepository(User)
    const res = await repo.insert(user).catch(e => {
        if (e.name === "QueryFailedError") {
            if (e.constraint === "UQ:users:screen_name") {
                ctx.throw(400, "そのスクリーンネーム、もうすでに使われてますよ")
            }
        }
        throw e
    })
    await createUserSession(ctx, user)
    ctx.redirect("/")
})

router.get("/logout", async ctx => {
    ctx.render("logout")
})

router.post("/logout", koaBody(), checkCsrf, async ctx => {
    const session = ctx.state.session!
    await getRepository(UserSession).update(
        {
            disabledAt: "NOW()",
        },
        {
            id: session.id,
        }
    )
    ctx.cookies.set(SESSION_COOKIE_NAME)
    ctx.redirect("/")
})

export default router
