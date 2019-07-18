import "reflect-metadata"
import Koa from "koa"
import { createConnection, getConnectionOptions } from "typeorm"
import webRouter from "./routers/web"
import apiRouter from "./routers/api"
import Router from "koa-router"
import { isProductionMode, FORCE_HTTPS } from "./config"
import WebSocket from "ws"
import http from "http"
import { streamingConnectionCallback } from "./routers/streaming"

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
router.use(webRouter.routes())
app.use(router.routes())

export async function databaseSetup() {
    const config = await getConnectionOptions()
    await createConnection({
        ...config,
        logging: isProductionMode ? [] : ["query"],
    })
}

export default server
