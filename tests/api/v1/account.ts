import { request } from "../../../src/server/utils/forTesting/testRequest"

describe("/api/v1/account", () => {
    describe("GET", () => {
        test("ちゃんと帰ってくる", async () => {
            await request(r =>
                r
                    .get("/api/v1/account")
                    .set("Authorization", "Bearer chihiro")
                    .expect(200)
                    .expect(r => {
                        expect(r.body.screenName).toBe("chihiro")
                    })
            )
        })
    })
    describe("PATCH", () => {
        test("普通に更新できる", async () => {
            await request(r =>
                r
                    .patch("/api/v1/account")
                    .set("Authorization", "Bearer chihiro")
                    .send({ name: "ちひろ" })
                    .expect(200)
                    .expect(r => {
                        expect(r.body.name).toBe("ちひろ")
                    })
            )
        })
        test("!omikuji", async () => {
            await request(r =>
                r
                    .patch("/api/v1/account")
                    .set("Authorization", "Bearer chihiro")
                    .send({ name: "!omikuji" })
                    .expect(200)
                    .expect(r => {
                        expect(r.body.name).toMatch(/^\!omikuji → ★.+/)
                    })
            )
        })
        test("★を普通に入れようとすると☆になる", async () => {
            await request(r =>
                r
                    .patch("/api/v1/account")
                    .set("Authorization", "Bearer chihiro")
                    .send({ name: "★ちひろ★" })
                    .expect(200)
                    .expect(r => {
                        expect(r.body.name).toBe("☆ちひろ☆")
                    })
            )
        })
    })
})
