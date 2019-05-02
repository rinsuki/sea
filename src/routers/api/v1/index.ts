import accountRouter from "./account"
import postsRouter from "./posts"
import timelinesRouter from "./timelines"
import { APIRouter } from "../router-class"

const router = new APIRouter()

router.use("/account", accountRouter.routes())
router.use("/posts", postsRouter.routes())
router.use("/timelines", timelinesRouter.routes())

export default router
