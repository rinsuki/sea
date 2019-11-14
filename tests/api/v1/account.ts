import { request } from "../../../src/utils/forTesting/testRequest"

describe("/api/v1/account", () => {
    test("認証がないとコケる", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .expect(400)
                .expect(r => {
                    expect(r.body.errors[0].message).toBe("Please authorize")
                    return true
                })
        )
    })
    test("適当な認証情報だとコケる", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .set("Authorization", "Bearer dummytoken")
                .expect(400)
                .expect(r => {
                    expect(r.body.errors[0].message).toBe("Authorize failed")
                    return true
                })
        )
    })
})
