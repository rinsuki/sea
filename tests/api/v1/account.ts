import { request } from "../../../src/utils/forTesting/testRequest"

describe("/api/v1/account", () => {
    test("認証がないなら弾く", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .expect(400)
                .expect(r => {
                    expect(r.body.errors[0].message).toBe("Please authorize")
                })
        )
    })
    test("変なトークンは弾く", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .set("Authorization", "hogehoge")
                .expect(400)
                .expect(r => expect(r.body.errors[0].message).toBe("Invalid authorize format"))
        )
    })
    test("変なトークン種別なら弾く", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .set("Authorization", "oreore token")
                .expect(400)
                .expect(r => expect(r.body.errors[0].message).toBe("Authorize type is invalid"))
        )
    })
    test("適当なトークンなら弾く", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .set("Authorization", "Bearer dummytoken")
                .expect(400)
                .expect(r => {
                    expect(r.body.errors[0].message).toBe("Authorize failed")
                })
        )
    })
})
