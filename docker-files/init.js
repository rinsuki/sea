const { S3 } = require('aws-sdk')
const { promisify } = require('util')

const getEnv = (name) => {
    if (!process.env[name]) {
        throw new Error(`Missing ${name} env`)
    }
    return process.env[name]
}
const getConfig = () => {
    const keys = ['S3_BUCKET', 'S3_ENDPOINT', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
    return keys.reduce((config, key) => {
        return {
            ...config,
            [key]: getEnv(key)
        }
    }, {})
}

const { S3_BUCKET, S3_ENDPOINT } = getConfig()
const s3 = new S3({
    endpoint: S3_ENDPOINT,
    s3ForcePathStyle: "yes",
})

const ALL_ALLOW_POLICY = `
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::*"]
        }
    ]
}
`

async function main() {
    await promisify(s3.createBucket.bind(s3))({
        Bucket: S3_BUCKET,
    }).catch(e => {
        if (e.code && e.code == 'BucketAlreadyOwnedByYou') {
            console.log('already created.')
            return
        }
        throw e
    })
    await promisify(s3.putBucketPolicy.bind(s3))({
        Bucket: S3_BUCKET,
        Policy: ALL_ALLOW_POLICY,
    })
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
