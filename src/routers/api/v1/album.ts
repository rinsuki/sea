import { APIRouter, APIRouterState, APIRouterCustom } from "../router-class"
import koaBody = require("koa-body")
import fileType from "file-type"
import fs from "fs"
import sharp from "sharp"
import { getConnection, getRepository, getManager } from "typeorm"
import { AlbumFileVariant } from "../../../db/entities/albumFileVariant"
import { AlbumFile, AlbumFileType } from "../../../db/entities/albumFile"
import { AlbumFileRepository } from "../../../db/repositories/albumFile"
import { EXT2MIME } from "../../../constants"
import moment from "moment"
import $ from "transform-ts"
import { $length, $literal, $stringNumber } from "../../../utils/transformers"
import { join } from "path"
import { execFilePromise } from "../../../utils/execFilePromise"
import { uploadFile } from "../../../utils/uploadFile"
import { ParameterizedContext } from "koa"
import getRawBody from "raw-body"
import { tmpdir } from "os"
import { randomBytes } from "crypto"

const router = new APIRouter()

const bodyParser = koaBody({
    multipart: true,
    urlencoded: false,
    json: false,
    text: false,
})

const ifNameConflictedConst = {
    addDateString: "add-date-string",
    error: "error",
} as const

declare const a: typeof ifNameConflictedConst[keyof typeof ifNameConflictedConst]

async function processUpload(
    ctx: ParameterizedContext<APIRouterState, APIRouterCustom>,
    file: { path: string; size: number },
    body: { name: string; folderId?: number; ifNameConflicted: typeof a }
) {
    if (file.size >= 16 * 1024 * 1024) return ctx.throw(400, "file-too-big")
    const buffer = await fs.promises.readFile(file.path)
    const type = await fileType.fromBuffer(buffer)
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
        type: "image" | "thumbnail" | "video",
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
        variant.hash = await uploadFile(buffer, extension)

        return variant
    }

    var promises: Promise<AlbumFileVariant>[] = []

    const webpLossyOptions = {
        quality: 80,
    }
    const webpLosslessOptions = {
        lossless: true,
    }
    const jpegOptions = {
        quality: 80,
    }

    async function imageUpload() {
        albumFile.type = AlbumFileType.IMAGE
        // image
        const image = sharp(buffer).rotate()
        const meta = await image.metadata()

        // orig画質
        if (isLossless || meta.hasAlpha) {
            promises.push(upload("image", "png", 90, image.png().toBuffer()))
        } else {
            promises.push(upload("image", "jpg", 90, image.jpeg(jpegOptions).toBuffer()))
        }
        promises.push(upload("image", "webp", 100, image.webp(isLossless ? webpLosslessOptions : webpLossyOptions).toBuffer()))

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
    }

    async function videoUpload() {
        albumFile.type = AlbumFileType.VIDEO
        const dir = await fs.promises.mkdtemp("sea-ffmpeg-tmp")
        try {
            const input = join(dir, "input.mp4")
            const output = join(dir, "video.mp4")
            const thumboutput = join(dir, "thumbnail.png")
            await fs.promises.writeFile(input, buffer)
            const { stdout: out } = await execFilePromise("ffprobe", [
                "-i",
                input,
                "-print_format",
                "json",
                "-show_streams",
                "-loglevel",
                "quiet",
            ])
            const info = $.obj({
                streams: $.array(
                    $.obj({
                        codec_type: $literal({ video: "video", audio: "audio" }),
                        codec_name: $.string,
                        pix_fmt: $.optional($.string),
                    })
                ),
            }).transformOrThrow(JSON.parse(out))
            const videoTracks = info.streams.filter(t => t.codec_type === "video")
            if (videoTracks.length !== 1) throw "Video track should only one."
            const videoTrack = videoTracks[0]
            if (videoTrack.pix_fmt !== "yuv420p" && videoTrack.pix_fmt !== "yuvj420p")
                throw "Video pix_fmt is should 'yuv420p' or 'yuvj420p'."
            if (videoTrack.codec_name !== "h264") throw "video codec is should 'H.264'."
            const audioTracks = info.streams.filter(t => t.codec_type === "audio")
            if (audioTracks.length > 1) throw "Audio track should only one or none."
            if (audioTracks.length) {
                const audioTrack = audioTracks[0]
                if (audioTrack.codec_name !== "aac") throw "Audio codec is should AAC."
            }
            await execFilePromise("ffmpeg", [
                "-i",
                input,
                "-codec",
                "copy",
                "-map_metadata",
                "-1",
                "-movflags",
                "faststart",
                output,
            ])
            await execFilePromise("ffmpeg", ["-i", input, "-vframes", "1", thumboutput])
            const image = sharp(await fs.promises.readFile(thumboutput))
            const thumb = image.resize(128, 128, {
                fit: "inside",
            })
            promises.push(upload("video", "mp4", 100, fs.promises.readFile(output)))
            promises.push(upload("thumbnail", "webp", 50, thumb.webp(webpLossyOptions).toBuffer()))
            promises.push(upload("thumbnail", "jpg", 25, thumb.jpeg(jpegOptions).toBuffer()))
        } catch (e) {
            throw e
        } finally {
            for (const f of await fs.promises.readdir(dir)) {
                await fs.promises.unlink(join(dir, f))
            }
            await fs.promises.rmdir(dir)
        }
    }

    switch (type.mime) {
        case "image/png":
        case "image/gif":
            isLossless = true
        case "image/webp":
        case "image/jpeg":
            await imageUpload()
            break
        case "video/quicktime":
        case "video/mp4":
            await videoUpload()
            break
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
}

router.post("/files", bodyParser, async ctx => {
    const { file } = $.obj({
        file: $.obj({
            path: $.string,
            size: $.number,
        }),
    }).transformOrThrow(ctx.request.files)

    const body = $.obj({
        name: $.string.compose($length({ min: 1 })),
        folderId: $.optional($.number),
        ifNameConflicted: $literal(ifNameConflictedConst),
    }).transformOrThrow(ctx.request.body)

    await processUpload(ctx, file, body)
})

router.post("/files/raw_upload", async ctx => {
    const arg = ctx.req.headers["x-sea-api-arg"]
    if (arg == null) {
        ctx.throw(400, "x-sea-api-arg header is required")
        return
    }
    if (Array.isArray(arg)) {
        ctx.throw(400, "x-sea-api-arg is must be only one header")
        return
    }
    const body = $.obj({
        name: $.string.compose($length({ min: 1 })),
        folderId: $.optional($.number),
        ifNameConflicted: $literal(ifNameConflictedConst),
    }).transformOrThrow(JSON.parse(arg))

    const binary = await getRawBody(ctx.req, { limit: 16 * 1024 * 1024 })
    const path = `${tmpdir()}/rawupload_${randomBytes(24).toString("hex")}`
    console.log(path)
    await fs.promises.writeFile(path, binary)
    const file = {
        path,
        size: binary.byteLength,
    }
    try {
        await processUpload(ctx, file, body)
    } finally {
        await fs.promises.unlink(path)
    }
})

router.delete("/files/:id", async ctx => {
    const { id } = $.obj({
        id: $stringNumber,
    }).transformOrThrow(ctx.params)
    const file = await getRepository(AlbumFile).findOne(id, {
        relations: ["user"],
    })
    if (file == null) return ctx.throw(404, "file not found")
    if (file.user.id !== ctx.state.token.user.id) return ctx.throw(400, "this file is not your file")
    await getRepository(AlbumFileVariant).update(
        {
            albumFileId: file.id,
        },
        {
            deletedAt: "NOW()",
        }
    )
    ctx.status = 204
})

export default router
