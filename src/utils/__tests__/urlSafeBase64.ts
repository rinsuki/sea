import { UrlSafeBase64 } from "../urlSafeBase64"

test("convert", () => {
    expect(UrlSafeBase64.convert("Aa0+/===")).toEqual("Aa0-_")
})

test("revert", () => {
    expect(UrlSafeBase64.revert("Aa0-_")).toEqual("Aa0+/===")
})
