import "reflect-metadata"
import Koa from "koa"
import { createConnection, getConnectionOptions } from "typeorm"
import webRouter from "./routers/web"

const app = new Koa()
app.use(webRouter.routes())

async function run() {
    const config = await getConnectionOptions()
    await createConnection({
        ...config,
        logging: ["query"],
    })
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`live in http://localhost:${port}`)
    })
}

run()
