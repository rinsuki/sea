import "reflect-metadata"
import Koa from "koa"
import { createConnection, getConnectionOptions } from "typeorm"
import webRouter from "./routers/web"
import apiRouter from "./routers/api"
import Router from "koa-router"
import { isProductionMode } from "./config"

const app = new Koa()
const router = new Router<any, any>()
router.use(
    "/api",
    async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*")
        ctx.set(
            "Access-Control-Allow-Methods",
            "GET, HEAD, POST, PUT, DELETE, PATCH"
        )
        ctx.set("Access-Control-Allow-Headers", "Authorization")
        ctx.set("Access-Control-Max-Age", (24 * 60 * 60).toString())

        await next()
    },
    apiRouter.routes()
)
router.use(webRouter.routes())
app.use(router.routes())

async function run() {
    const config = await getConnectionOptions()
    await createConnection({
        ...config,
        logging: isProductionMode ? [] : ["query"],
    })
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`live in http://localhost:${port}`)
    })
}

run()
