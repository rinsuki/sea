import { CustomEmoji } from "../../../db/entities/customEmoji"
import { getRepository, IsNull } from "typeorm"
import { APIRouter } from "../router-class"
import { CustomEmojiRepository } from "../../../db/repositories/customEmoji"

const router = new APIRouter()

router.get("/", async ctx => {
    await ctx.sendMany(CustomEmojiRepository, await getRepository(CustomEmoji).find({ deletedAt: IsNull() }))
})

export default router
