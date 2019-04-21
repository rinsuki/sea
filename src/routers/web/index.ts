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
import { UserSession } from "../../db/entities/userSession"
import { SESSION_COOKIE_NAME } from "../../constants"
import loginRouter from "./login"
import registerRouter from "./register"
import logoutRouter from "./logout"

const router = new Router<WebRouterState, WebRouterCustom>()

export type WebRouterState = { session?: UserSession }
export type WebRouterCustom = { render: (name: string, locals?: {}) => void }

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

router.use("/register", registerRouter.routes())
router.use("/login", loginRouter.routes())
router.use("/logout", logoutRouter.routes())

export default router
