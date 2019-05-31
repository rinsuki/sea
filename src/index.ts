import server, { databaseSetup } from "./app"

databaseSetup().then(() => {
    const port = process.env.PORT || 3000
    server.listen(port, () => {
        console.log(`live in http://localhost:${port}`)
    })
})
