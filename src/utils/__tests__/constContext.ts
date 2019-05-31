import $, { Context } from "cafy"
import { ConstContext } from "../constContext"

describe("stringのとき", () => {
    // normal, undefined, null, invalid
    const validValue = "valid"
    const invalidValue = "invalid"
    const values = [validValue, undefined, null, invalidValue]
    const checkTable = [
        ["normal", $.type(ConstContext(validValue)), [true, false, false, false]],
        ["optional", $.type(ConstContext(validValue)).makeOptional(), [true, true, false, false]],
        ["nullable", $.type(ConstContext(validValue)).makeNullable(), [true, false, true, false]],
        ["optionalNullable", $.type(ConstContext(validValue)).makeOptionalNullable(), [true, true, true, false]],
    ] as [string, Context, [boolean, boolean, boolean, boolean]][]
    for (const v of checkTable) {
        describe(v[0], () => {
            for (const [i, n] of values.entries()) {
                const flag = v[2][i]
                test("" + n, () => {
                    if (flag) {
                        expect(v[1].throw(n)).toEqual(n)
                    } else {
                        expect(() => v[1].throw(n)).toThrow()
                    }
                })
            }
        })
    }
})

// WIP: TypeScriptの型チェックしたい
