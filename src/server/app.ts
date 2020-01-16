import "reflect-metadata"
import Koa from "koa"
import { createConnection, getConnectionOptions } from "typeorm"
import webRouter from "./routers/web"
import apiRouter from "./routers/api"
import Router from "koa-router"
import { isProductionMode, FORCE_HTTPS, isTestMode } from "./config"
import WebSocket from "ws"
import http from "http"
import { streamingConnectionCallback } from "./routers/streaming"
import koaStatic from "koa-static"
import path from "path"

const app = new Koa()
if (FORCE_HTTPS)
    app.use(async (ctx, next) => {
        if (ctx.request.headers["x-forwarded-proto"] !== "https") {
            const url = ctx.request.URL
            url.protocol = "https"
            ctx.redirect(url.toString())
            return
        }
        await next()
    })
const server = http.createServer(app.callback())
const ws = new WebSocket.Server({ server })
ws.addListener("connection", streamingConnectionCallback)

const router = new Router<any, any>()
router.use("/api", apiRouter.routes())
console.log(path.join(__dirname, "../../dist/client/assets"))
router.use(
    "/assets",
    async (ctx, next) => {
        ctx.path = ctx.path.replace(/^\/assets/, "")
        return await next()
    },
    koaStatic(path.join(__dirname, "../../dist/client/assets"), {}),
    ctx => {}
)
router.get("*", async ctx => {
    ctx.body = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex"></head><body><div id="app"></div><script src="/assets/bundle.js"></script></body></html>`
})
app.use(router.routes())

export async function databaseSetup() {
    const config = await getConnectionOptions()
    await createConnection({
        ...config,
        logging: isProductionMode || isTestMode ? [] : ["query"],
    })
}

export default server
