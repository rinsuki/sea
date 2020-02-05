import { createHash } from "crypto"
import { getRepository } from "typeorm"
import { StorageFile } from "../db/entities/storageFile"
import { S3_BUCKET, S3_ENDPOINT, S3_FORCE_USE_PATH_STYLE, S3_BUCKET_INITIALIZE } from "../config"
import AWS from "aws-sdk"
import { getPathFromHash } from "./getPathFromHash"
import { EXT2MIME } from "../constants"

const s3 = new AWS.S3({
    endpoint: S3_ENDPOINT,
    s3ForcePathStyle: S3_FORCE_USE_PATH_STYLE === "yes",
})

if (S3_BUCKET_INITIALIZE) {
    s3.createBucket({ Bucket: S3_BUCKET }, (err) => console.error(err))
}

export async function uploadFile(buffer: Buffer, extension: keyof typeof EXT2MIME): Promise<string> {
    const hash = createHash("sha512")
        .update(buffer)
        .digest("hex")
    if ((await getRepository(StorageFile).findOne({ hash })) != null) {
        return hash
    }
    const file = new StorageFile()
    file.hash = hash
    await getRepository(StorageFile).save(file)
    try {
        const upload = s3.upload({
            Body: buffer,
            Bucket: S3_BUCKET,
            Key: getPathFromHash(hash),
            CacheControl: "max-age=604870; must-revalidate", // 7 days
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
    } catch (e) {
        await getRepository(StorageFile).remove(file)
        throw e
    }
    return hash
}
