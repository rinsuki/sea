import $ from "cafy"
import { ConstContext } from "../constContext"

describe("stringのとき", () => {
    test("同じなら通る", () => {
        expect($.type(ConstContext("test")).throw("test")).toEqual("test")
    })

    test("違うと通らない", () => {
        expect(() => $.type(ConstContext("test")).throw("fuga")).toThrow()
    })
})

// WIP: TypeScriptの型チェックしたい
