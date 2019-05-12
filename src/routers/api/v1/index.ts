import accountRouter from "./account"
import postsRouter from "./posts"
import timelinesRouter from "./timelines"
import albumRouter from "./album"
import { APIRouter } from "../router-class"

const router = new APIRouter()

router.use("/account", accountRouter.routes())
router.use("/posts", postsRouter.routes())
router.use("/timelines", timelinesRouter.routes())
router.use("/album", albumRouter.routes())

export default router
