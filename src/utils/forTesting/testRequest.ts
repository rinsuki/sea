import req from "supertest"
import server, { databaseSetup } from "../../app"

const databasePromise = databaseSetup()

export async function request<T>(r: (r: req.SuperTest<req.Test>) => T): Promise<T> {
    await databasePromise
    return r(req(process.env.SEA_REMOTE_TEST_URL || server))
}
