require("dotenv").config()

import $ from "transform-ts"
import { $literal } from "./utils/transformers"
import { RequestOptions } from "web-push"

export const isProductionMode = process.env.NODE_ENV === "production"
if (isProductionMode === false) {
    console.warn("productionモードじゃないで")
}

const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY
if (RECAPTCHA_SITE_KEY == null) {
    if (isProductionMode) {
        throw "reCAPTCHAの設定がされていません。productionモードではreCAPTCHAは必須です。"
    } else {
        console.warn("reCAPTCHAの設定がされていません。新規登録やログインのCSRF攻撃に対して脆弱です。")
    }
}

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
if (RECAPTCHA_SITE_KEY != null && RECAPTCHA_SECRET_KEY == null) {
    console.error("reCAPTCHAのサイトキーが指定されているのにシークレットキーが指定されていません。")
    process.exit(1)
}

export const RECAPTCHA:
    | {
          SITE_KEY: string
          SECRET_KEY: string
      }
    | undefined =
    RECAPTCHA_SITE_KEY != null && RECAPTCHA_SECRET_KEY != null
        ? {
              SITE_KEY: RECAPTCHA_SITE_KEY,
              SECRET_KEY: RECAPTCHA_SECRET_KEY,
          }
        : undefined

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
export const FORCE_HTTPS = !!process.env.FORCE_HTTPS

export const { S3_BUCKET, S3_ENDPOINT, S3_PUBLIC_URL, S3_FORCE_USE_PATH_STYLE } = $.obj({
    S3_BUCKET: $.string,
    S3_ENDPOINT: $.string,
    S3_PUBLIC_URL: $.string,
    S3_FORCE_USE_PATH_STYLE: $literal({ yes: "yes", no: "no" } as const),
}).transformOrThrow(process.env)

const { SW_KEY_PUBLIC, SW_KEY_PRIVATE, SW_SUBJECT } = $.obj({
    SW_KEY_PUBLIC: $.string,
    SW_KEY_PRIVATE: $.string,
    SW_SUBJECT: $.string,
}).transformOrThrow(process.env)

export const WP_OPTIONS: RequestOptions = {
    vapidDetails: {
        subject: SW_SUBJECT,
        publicKey: SW_KEY_PUBLIC,
        privateKey: SW_KEY_PRIVATE,
    },
    TTL: 60,
}
