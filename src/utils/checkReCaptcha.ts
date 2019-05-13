import { RouterContext } from "koa-router"
import $ from "cafy"
import { RECAPTCHA } from "../config"
import axios from "axios"
import { URLSearchParams } from "url"

export async function checkReCaptcha(ctx: RouterContext, next: () => Promise<void>) {
    const body = $.obj({
        "g-recaptcha-response": $.str.makeOptional(),
    }).throw(ctx.request.body)
    const recaptchaResponse = body["g-recaptcha-response"]
    delete ctx.request.body["g-recaptcha-response"]
    // reCAPTCHAが設定で有効なのにない || 無効なのにある 場合を検出
    if ((recaptchaResponse != null) == (RECAPTCHA != null)) {
        if (RECAPTCHA != null) {
            // reCAPTCHAが有効だったら検出
            if (recaptchaResponse == null) {
                return ctx.throw(400, "reCAPTCHAは必須です")
            }

            const params = new URLSearchParams()
            params.append("secret", RECAPTCHA.SECRET_KEY)
            params.append("response", recaptchaResponse)

            const res = await axios.post<{ success: boolean }>("https://www.google.com/recaptcha/api/siteverify", params)

            // STAGE FAILED
            if (res.data.success === false) {
                console.log(res.data)
                return ctx.throw(400, "reCAPTCHA検証に失敗しました")
            }
        }
    } else {
        ctx.throw(400, "reCAPTCHAが矛盾しています")
    }
    await next()
}
