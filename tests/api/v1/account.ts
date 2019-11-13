import { request } from "../../../src/utils/forTesting/testRequest"

describe("/api/v1/account", () => {
    test("認証がないとコケる", async () => {
        await request(r => {
            return r.get("/api/v1/account").expect(400)
        })
    })
})
