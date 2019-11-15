import { request } from "../../../src/utils/forTesting/testRequest"

describe("/api/v1/posts", () => {
    describe("POST", () => {
        test("ちゃんと帰ってくる", async () => {
            await request(r =>
                r
                    .post("/api/v1/posts")
                    .set("Authorization", "Bearer chihiro")
                    .send({ text: "おはようございます" })
                    .expect(200)
                    .expect(r => {
                        expect(r.body.text).toEqual("おはようございます")
                        expect(r.body.user.screenName).toEqual("chihiro")
                        expect(r.body.application.name).toEqual("derepo web")
                        expect(r.body.files.length).toEqual(0)
                    })
            )
        })
    })
})
