import { isNotNull } from "../isNotNull"

describe("src/utils/isNotNull", () => {
    test("nullを渡すとfalse", () => {
        expect(isNotNull(null)).toBe(false)
    })
    test("undefinedを渡すとfalse", () => {
        expect(isNotNull(undefined)).toBe(false)
    })
    test("0を渡すとtrue", () => {
        expect(isNotNull(0)).toBe(true)
    })
    test("空文字列を渡すとtrue", () => {
        expect(isNotNull("")).toBe(true)
    })
    test("空オブジェクトを渡すとtrue", () => {
        expect(isNotNull({})).toBe(true)
    })
})
