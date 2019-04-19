import "reflect-metadata"
import Koa from "koa"
import { createConnection } from "typeorm"
import webRouter from "./routers/web"

const app = new Koa()
app.use(webRouter.routes())
createConnection().then(() => {
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`live in http://localhost:${port}`)
    })
})
