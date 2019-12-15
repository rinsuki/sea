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
        describe("重複検知", () => {
            test("同じ投稿内容はリジェクトされる", async () => {
                await request(r =>
                    r
                        .post("/api/v1/posts")
                        .set("Authorization", "Bearer rin")
                        .send({ text: "ののー" })
                        .expect(200)
                )
                await request(r =>
                    r
                        .post("/api/v1/posts")
                        .set("Authorization", "Bearer rin")
                        .send({ text: "ののー" })
                        .expect(400)
                        .expect(r => {
                            expect(r.body.errors[0].message).toBe(
                                "already posted with same text (and attached files). please check timeline."
                            )
                        })
                )
            })
            test("違う投稿内容であればリジェクトされない", async () => {
                await request(r =>
                    r
                        .post("/api/v1/posts")
                        .set("Authorization", "Bearer uzuki")
                        .send({ text: "響子ちゃーん" })
                        .expect(200)
                )
                await request(r =>
                    r
                        .post("/api/v1/posts")
                        .set("Authorization", "Bearer uzuki")
                        .send({ text: "美穂ちゃーん" })
                        .expect(200)
                )
            })
        })
    })
})
