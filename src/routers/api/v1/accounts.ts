import { APIRouter } from "../router-class"
import { getCustomRepository } from "typeorm"
import { UserRepository } from "../../../db/repositories/user"

const router = new APIRouter()

router.get("/my", async ctx => {
    ctx.send(UserRepository, ctx.state.token.user)
})

export default router
