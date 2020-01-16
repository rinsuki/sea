import accountRouter from "./account"
import postsRouter from "./posts"
import timelinesRouter from "./timelines"
import albumRouter from "./album"
import webpushRouter from "./webpush"
import { APIRouter } from "../router-class"

const router = new APIRouter()

router.use("/account", accountRouter.routes())
router.use("/posts", postsRouter.routes())
router.use("/timelines", timelinesRouter.routes())
router.use("/album", albumRouter.routes())
router.use("/webpush", webpushRouter.routes())

export default router
