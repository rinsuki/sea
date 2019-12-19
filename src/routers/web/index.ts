import Router from "koa-router"
import pug from "pug"
import { isProductionMode, RECAPTCHA } from "../../config"
import { join } from "path"
import fs from "fs"
import { setUserSessionToState } from "../../utils/setUserSessionToState"
import { UserSession } from "../../db/entities/userSession"
import loginRouter from "./login"
import registerRouter from "./register"
import logoutRouter from "./logout"
import inputInviteCodeRouter from "./inputInviteCode"
import settingsRouter from "./settings"
import oauthRouter from "./oauth"
import oauthTokenRouter from "./token"
import applicationsRouter from "./applications"
import exploreRouter from "./explore"
import postsRouter from "./posts"
import { requireVerifyInviteCode } from "../../utils/requireVerifyInviteCode"

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
        ctx.set("X-Frame-Options", "DENY")
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
router.use("/input_invite_code", inputInviteCodeRouter.routes())
router.use("/settings", requireVerifyInviteCode, settingsRouter.routes())
router.use("/oauth/token", oauthTokenRouter.routes())
router.use("/oauth", requireVerifyInviteCode, oauthRouter.routes())
router.use("/applications", requireVerifyInviteCode, applicationsRouter.routes())
router.use("/explore", requireVerifyInviteCode, exploreRouter.routes())
router.use("/posts", requireVerifyInviteCode, postsRouter.routes())

export default router
