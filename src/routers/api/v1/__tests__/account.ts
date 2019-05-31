import { request } from "../../../../utils/forTesting/testRequest"

describe("/api/v1/account", () => {
    test("認証がないとコケる", () =>
        request(r => {
            return r.get("/api/v1/account").expect(503)
        }))
})
