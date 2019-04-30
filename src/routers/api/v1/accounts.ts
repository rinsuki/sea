import { APIRouter } from "../router-class"
import { getCustomRepository } from "typeorm"
import { UserRepository } from "../../../db/repositories/user"

const router = new APIRouter()

router.get("/my", async ctx => {
    ctx.body = await getCustomRepository(UserRepository).pack(
        ctx.state.token.user
    )
})

export default router
