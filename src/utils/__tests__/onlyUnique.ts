import { onlyUnique } from "../onlyUnique"

describe("stringのとき", () => {
    test("被ってるやつがなかったら変わらない", () => {
        const arr = [{ name: "hoge" }, { name: "fuga" }, { name: "piyo" }]
        expect(onlyUnique(arr, "name")).toStrictEqual(arr)
    })
    test("被ってるやつがあったら最初のだけ残る", () => {
        expect(
            onlyUnique([{ name: "hoge", score: 1 }, { name: "hoge", score: 2 }, { name: "fuga", score: 3 }], "name")
        ).toStrictEqual([{ name: "hoge", score: 1 }, { name: "fuga", score: 3 }])
    })
    test("keyじゃないところが被っても関与しない", () => {
        const arr = [{ name: "hoge", type: "human" }, { name: "fuga", type: "human" }, { name: "piyo", type: "bot" }]
        expect(onlyUnique(arr, "name")).toStrictEqual(arr)
    })
})
