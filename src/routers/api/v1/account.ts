import { APIRouter } from "../router-class"
import { UserRepository } from "../../../db/repositories/user"
import koaBody = require("koa-body")
import { getRepository } from "typeorm"
import { User } from "../../../db/entities/user"
import { AlbumFile, AlbumFileType } from "../../../db/entities/albumFile"
import $ from "transform-ts"
import { $length } from "../../../utils/transformers"

const router = new APIRouter()

router.get("/", async ctx => {
    await ctx.send(UserRepository, ctx.state.token.user)
})
router.redirect("/verify_credentials", "/api/v1/account", 308)

const omikuji = ["大吉", "中吉", "吉", "小吉", "末吉", "凶", "大凶", "はずれ"]

router.patch("/", koaBody(), async ctx => {
    const body = $.obj({
        name: $.optional($.string.compose($length({ min: 1, max: 20 }))),
        avatarFileId: $.optional($.number),
    }).transformOrThrow(ctx.request.body)

    const user = ctx.state.token.user
    if (body.name != null) user.name = body.name.replace(/★/g, "☆")
    if (user.name === "!omikuji") {
        user.name += " → ★" + omikuji[Math.floor(Math.random() * omikuji.length)]
    }
    if (body.avatarFileId === 0) {
        user.avatarFile = null
    } else if (body.avatarFileId) {
        user.avatarFile = await getRepository(AlbumFile).findOneOrFail({
            id: body.avatarFileId,
            user,
        })
        if (user.avatarFile.type !== AlbumFileType.IMAGE) throw "お前何をアイコンにしようとしてんねん"
    }
    await getRepository(User).save(user)
    await ctx.send(UserRepository, user)
})

export default router
