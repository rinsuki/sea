import Router = require("@koa/router")
import { WebRouterState, WebRouterCustom } from ".."
import { CustomEmojisIndex } from "../../../components/pages/settings/customEmojis"
import { CustomEmoji } from "../../../db/entities/customEmoji"
import { getRepository, Not, IsNull } from "typeorm"
import $ from "transform-ts"
import { CustomEmojisNew } from "../../../components/pages/settings/customEmojis/new"
import koaBody = require("koa-body")
import fs from "fs"
import fileType = require("file-type")
import sharp = require("sharp")
import { uploadFile } from "../../../utils/uploadFile"
import { checkCsrf } from "../../../utils/checkCsrf"

const router = new Router<WebRouterState, WebRouterCustom>()

const bodyParser = koaBody({
    multipart: true,
    urlencoded: false,
    json: false,
    text: false,
})

router.get("/", async ctx => {
    const { sort } = $.obj({ sort: $.optional($.literal("date", "name", "uploader")) }).transformOrThrow(ctx.query)
    if (sort == null) return ctx.redirect("?sort=name")
    const sortKey = ({
        date: "createdAt",
        name: "shortcode",
        uploader: "user",
    } as const)[sort]
    ctx.renderReact(CustomEmojisIndex, {
        emojis: await getRepository(CustomEmoji).find({
            where: { deletedAt: IsNull() },
            order: { [sortKey]: sortKey === "createdAt" ? "DESC" : "ASC" },
            relations: ["user"],
        }),
    })
})

router.get("/new", async ctx => {
    ctx.renderReact(CustomEmojisNew, {
        csrf: ctx.state.session!.getCookieValue(),
    })
})

router.post("/new", bodyParser, checkCsrf, async ctx => {
    const { shortcode } = $.obj({ shortcode: $.string }).transformOrThrow(ctx.request.body)
    if (!/^[A-Za-z0-9_]{1,32}$/.test(shortcode)) return ctx.throw(400, "shortcodeがおかしい")
    if (null != (await getRepository(CustomEmoji).findOne({ shortcode, deletedAt: IsNull() })))
        return ctx.throw(400, "そのshortcodeはもうすでに使われてる")
    const { file } = $.obj({
        file: $.obj({
            path: $.string,
            size: $.number,
        }),
    }).transformOrThrow(ctx.request.files)
    if (file.size > 256 * 1024) return ctx.throw(400, "でかすぎ")
    const buffer = await fs.promises.readFile(file.path)
    const type = await fileType.fromBuffer(buffer)
    if (type == null) return ctx.throw(400, "なにこのファイル")

    let isLossless = false

    switch (type.mime) {
        case "image/png":
            isLossless = true
            break
        case "image/jpeg":
            break
        default:
            ctx.throw(400, "このファイル形式はだめ")
            return
    }
    const image = sharp(buffer).rotate()
    const meta = await image.metadata()
    if (meta.width == null) return ctx.throw(400, "width null")
    if (meta.height == null) return ctx.throw(400, "height null")
    const aspect = Math.max(meta.width, meta.height) / Math.min(meta.width, meta.height)
    if (aspect > 2) return ctx.throw(400, "縦横比やばい")

    let lastImage = isLossless ? image.png() : image.jpeg({ quality: 80 })

    const emoji = new CustomEmoji()
    emoji.user = ctx.state.session!.user
    emoji.shortcode = shortcode
    emoji.hash = await uploadFile(await lastImage.toBuffer(), isLossless ? "png" : "jpg")
    emoji.width = meta.width
    emoji.height = meta.height
    await getRepository(CustomEmoji).save(emoji)
    ctx.redirect("/settings/custom_emojis?sort=date")
})

export default router
