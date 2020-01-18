import Router = require("koa-router")
import { WebRouterState, WebRouterCustom } from ".."
import { CustomEmojisIndex } from "../../../components/pages/settings/customEmojis"
import { CustomEmoji } from "../../../db/entities/customEmoji"
import { getRepository } from "typeorm"
import $ from "transform-ts"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    const { sort } = $.obj({ sort: $.optional($.literal("date", "name", "uploader")) }).transformOrThrow(ctx.query)
    if (sort == null) return ctx.redirect("?sort=name")
    const sortKey = ({
        date: "createdAt",
        name: "shortcode",
        uploader: "user",
    } as const)[sort]
    ctx.renderReact(CustomEmojisIndex, {
        emojis: await getRepository(CustomEmoji).find({ order: { [sortKey]: sortKey === "createdAt" ? "DESC" : "ASC" } }),
    })
})

export default router
