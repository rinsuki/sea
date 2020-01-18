import Router = require("koa-router")
import { WebRouterState, WebRouterCustom } from ".."
import { ExploreStats } from "../../../components/pages/explore/stats"
import { getRepository, getConnection, Not, IsNull } from "typeorm"
import { User } from "../../../db/entities/user"
import { AlbumFile } from "../../../db/entities/albumFile"
import { Post } from "../../../db/entities/post"

const router = new Router<WebRouterState, WebRouterCustom>()

router.get("/", async ctx => {
    ctx.renderReact(ExploreStats, {
        count: {
            users: await getRepository(User).count({ where: { inviteCode: Not(IsNull()) } }),
            posts: await getRepository(Post).count(),
            files: await getRepository(AlbumFile).count(),
            bytes: parseInt(
                (
                    await getConnection().query(
                        "SELECT (SELECT SUM(size) FROM (SELECT size FROM album_file_variants WHERE hash IS NOT NULL GROUP BY hash, size ORDER BY count(*) DESC) as p) + (SELECT SUM(size) FROM album_file_variants WHERE hash IS NULL) as size"
                    )
                )[0].size,
                10
            ),
        },
    })
})

export default router
