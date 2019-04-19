import "reflect-metadata"
import Koa from "koa"
import { createConnection } from "typeorm"
import webRouter from "./routers/web"

const app = new Koa()
app.use(webRouter.routes())
createConnection().then(() => {
    app.listen(3000 || process.env.PORT)
})
