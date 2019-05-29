import { APIRouter } from "../router-class"
import koaBody = require("koa-body")
import $ from "cafy"
import fileType from "file-type"
import fs from "fs"
import sharp from "sharp"
import { getConnection, getRepository, getManager } from "typeorm"
import { AlbumFileVariant } from "../../../db/entities/albumFileVariant"
import { AlbumFile } from "../../../db/entities/albumFile"
import path from "path"
import AWS from "aws-sdk"
import { S3_BUCKET, S3_ENDPOINT, S3_FORCE_USE_PATH_STYLE } from "../../../config"
import { promisify } from "util"
import { AlbumFileRepository } from "../../../db/repositories/albumFile"
import { EXT2MIME } from "../../../constants"
import { ConstContext } from "../../../utils/constContext"
import moment from "moment"

const s3 = new AWS.S3({
    endpoint: S3_ENDPOINT,
    s3ForcePathStyle: S3_FORCE_USE_PATH_STYLE === "yes",
})

const router = new APIRouter()

const bodyParser = koaBody({
    multipart: true,
    urlencoded: false,
    json: false,
    text: false,
})

const ifNameConflictedConst = ["add-date-string", "error"] as const

router.post("/files", bodyParser, async ctx => {
    const { file } = $.obj({
        file: $.obj({
            name: $.str.makeOptional(),
            path: $.str,
            size: $.num,
        }),
    }).throw(ctx.request.files)
    const body = $.obj({
        name: $.str.min(1),
        folderId: $.num.makeOptional(),
        ifNameConflicted: $.either($.type(ConstContext("add-date-string")), $.type(ConstContext("error"))),
    }).throw(ctx.request.body)
    if (file.size >= 16 * 1024 * 1024) return ctx.throw(400, "file-too-big")
    const buffer = await fs.promises.readFile(file.path)
    const type = fileType(buffer)
    if (type == null) return ctx.throw(400, "Unknown file type")
    var isLossless = false

    if (await getRepository(AlbumFile).findOne({ name: body.name, user: ctx.state.token.user })) {
        switch (body.ifNameConflicted) {
            case "add-date-string":
                body.name += ` (${moment().format("YYYY-MM-DD_HH-mm-ss")})`
                break
            case "error":
                throw ctx.throw(400, "This name is already exists.")
        }
    }
    const [{ nextval: fileId }] = await getConnection().query("SELECT nextval(pg_get_serial_sequence('album_files', 'id'))")
    const albumFile = new AlbumFile()
    albumFile.id = parseInt(fileId)
    albumFile.name = body.name
    albumFile.user = ctx.state.token.user

    async function upload(
        type: "image" | "thumbnail",
        extension: keyof typeof EXT2MIME,
        score: number,
        bufferPromise: Promise<Buffer>
    ) {
        const [{ nextval: variantId }] = await getConnection().query(
            "SELECT nextval(pg_get_serial_sequence('album_file_variants', 'id'))"
        )
        const buffer = await bufferPromise
        if (buffer.length >= 32 * 1024 * 1024) return ctx.throw(400, "file-too-complicated")
        const variant = new AlbumFileVariant()
        variant.id = parseInt(variantId)
        variant.albumFile = albumFile
        variant.size = buffer.length
        variant.type = type
        variant.extension = extension
        variant.score = score
        const upload = s3.upload({
            Body: buffer,
            Bucket: S3_BUCKET,
            Key: variant.toPath(),
            ContentType: EXT2MIME[extension],
        })
        const res = await new Promise((resolve, reject) => {
            upload.send((err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
        console.log(res)
        return variant
    }

    var promises: Promise<AlbumFileVariant>[] = []

    switch (type.mime) {
        case "image/png":
        case "image/gif":
            isLossless = true
        case "image/webp":
        case "image/jpeg":
            // image
            const image = sharp(buffer).rotate()
            const webpLossyOptions = {
                quality: 80,
            }
            const webpLosslessOptions = {
                lossless: true,
            }
            const jpegOptions = {
                quality: 80,
            }
            const meta = await image.metadata()

            // orig画質
            if (isLossless || meta.hasAlpha) {
                promises.push(upload("image", "png", 90, image.png().toBuffer()))
            } else {
                promises.push(upload("image", "jpg", 90, image.jpeg(jpegOptions).toBuffer()))
            }
            promises.push(
                upload("image", "webp", 100, image.webp(isLossless ? webpLosslessOptions : webpLossyOptions).toBuffer())
            )

            // サムネイル
            const thumb = image.resize(128, 128, {
                fit: "inside",
            })
            promises.push(upload("thumbnail", "webp", 50, thumb.webp(webpLossyOptions).toBuffer()))
            if (meta.hasAlpha) {
                promises.push(upload("thumbnail", "png", isLossless ? 25 : 0, thumb.png().toBuffer()))
            } else {
                promises.push(upload("thumbnail", "jpg", 10, thumb.jpeg(jpegOptions).toBuffer()))
            }
            break
        case "video/quicktime":
        case "video/mp4":
        // video
        // wip
        default:
            return ctx.throw(400, "Not supported file type")
    }

    const variants = await Promise.all(promises)
    await getManager().transaction(async manager => {
        await manager.getRepository(AlbumFile).save(albumFile)
        await manager.getRepository(AlbumFileVariant).save(variants)
    })
    albumFile.variants = variants
    await ctx.send(AlbumFileRepository, albumFile)
})

export default router
