import { request } from "../../src/server/utils/forTesting/testRequest"

describe("CORS headers", () => {
    test("Originがないなら付けない", async () => {
        await request(r =>
            r.get("/api/v1/account").expect(r => {
                expect(r.header["access-control-allow-origin"]).toBeUndefined()
            })
        )
    })

    test("OriginがあったらAccess-Control-Allow-Originだけ付ける", async () => {
        await request(r =>
            r
                .get("/api/v1/account")
                .set("Origin", "https://sea-client.example")
                .expect(r => {
                    expect(r.header["access-control-allow-origin"]).toBe("*")
                    expect(r.header["access-control-allow-methods"]).toBeUndefined()
                })
        )
    })

    test("OPTIONSリクエストならAllow-Methodsとかも付ける", async () => {
        await request(r =>
            r
                .options("/api/v1/account")
                .set("Origin", "https://sea-client.example")
                .expect(r => {
                    expect(r.header["access-control-allow-origin"]).toBe("*")
                    expect(r.header["access-control-allow-methods"]).toBe("GET, HEAD, POST, PUT, DELETE, PATCH")
                    expect(r.header["access-control-allow-headers"]).toBe("Authorization, Content-Type")
                    expect(r.header["access-control-max-age"]).toBe((24 * 60 * 60).toString())
                })
        )
    })
})
