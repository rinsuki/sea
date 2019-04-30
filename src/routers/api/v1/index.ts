import accountsRouter from "./accounts"
import { APIRouter } from "../router-class"

const router = new APIRouter()

router.use("/accounts", accountsRouter.routes())

export default router
