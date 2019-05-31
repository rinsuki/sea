import { onlyUnique } from "../onlyUnique"

describe("stringのとき", () => {
    test("被ってるやつがなかったら変わらない", () => {
        const arr = [{ name: "hoge" }, { name: "fuga" }, { name: "piyo" }]
        expect(onlyUnique(arr, "name")).toStrictEqual(arr)
    })
})
