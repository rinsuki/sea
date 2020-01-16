import { isTestMode } from "../server/config"
import { getRepository, getConnection } from "typeorm"
import { User } from "../server/db/entities/user"
import { databaseSetup } from "../server/app"
import { Application } from "../server/db/entities/application"
import { AccessToken } from "../server/db/entities/accessToken"
import { InviteCode } from "../server/db/entities/inviteCode"

async function main() {
    if (!isTestMode) {
        console.error("process.env.NODE_ENV=test である必要があります")
        process.exit(1)
        return
    }

    console.log("Connecting to Database…")
    await databaseSetup()

    console.log("TRUNCATE TABLE")
    const tables: { table_name: string }[] = await getConnection().query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name != 'migrations'"
    )
    await getConnection().query(`TRUNCATE TABLE ${tables.map(t => t.table_name).join(", ")} RESTART IDENTITY`)

    console.log("user")
    const users = {
        chihiro: new User(),
        producer: new User(),

        rin: new User(),
        uzuki: new User(),
        mio: new User(),
        anzu: new User(),

        yakkai: new User(),
    }

    for (const name of Object.keys(users) as (keyof typeof users)[]) {
        users[name].name = name
        users[name].screenName = name
        users[name].encryptedPassword = "!dummy"
        if (name === "chihiro" || name === "producer") {
            users[name].canMakeInviteCode = true
        }
        users[name].minReadableDate = new Date(0)
    }

    await getRepository(User).save(Object.values(users))

    console.log("applications")

    const app = new Application()
    app.name = "derepo web"
    app.clientId = "derepo_client_id"
    app.clientSecret = "derepo_client_secret"
    app.description = "derepo web client"
    app.ownerUser = users.producer

    await getRepository(Application).save(app)

    console.log("access token")

    await getRepository(AccessToken).save(
        Object.values(users).map(user => {
            const token = new AccessToken()
            token.application = app
            token.user = user
            token.token = user.screenName
            return token
        })
    )
    await getRepository(AccessToken).save(
        Object.values(users).map(user => {
            const token = new AccessToken()
            token.application = app
            token.user = user
            token.token = "revoked." + user.screenName
            token.revokedAt = new Date(0)
            return token
        })
    )

    console.log("invite codes")
    const invites = [
        "chihiro:chihiro",
        "chihiro:producer",
        "producer:rin",
        "producer:uzuki",
        "producer:mio",
        "producer:anzu",
    ] as const
    await getRepository(InviteCode).save(
        invites.map(invite => {
            const [sender, receiver] = invite.split(":")
            const code = new InviteCode()
            code.generateCode()
            code.fromUser = users[sender as keyof typeof users]
            code.toUser = users[receiver as keyof typeof users]
            users[receiver as keyof typeof users].inviteCode = code
            code.memo = invite
            return code
        })
    )
    await getRepository(User).save(Object.values(users).filter(u => u.inviteCode != null))
}

main()
    .then(() => {
        console.log("Finish!")
        process.exit(0)
    })
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
