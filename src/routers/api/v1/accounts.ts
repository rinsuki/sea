import { APIRouter } from "../router-class"

const router = new APIRouter()

router.get("/my", async ctx => {
    ctx.body = ctx.state.token.user.id
})

export default router
