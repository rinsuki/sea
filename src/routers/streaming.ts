import WebSocket from "ws"
import { getRepository, getCustomRepository } from "typeorm"
import { AccessToken } from "../db/entities/accessToken"
import { getRedisConnection } from "../utils/getRedisConnection"
import { PostRepository } from "../db/repositories/post"
import { Post } from "../db/entities/post"

type Message<T> =
    | {
          type: "error"
          message: string
      }
    | {
          type: "success"
      }
    | {
          type: "message"
          content: T
      }

export function streamingConnectionCallback(ws: WebSocket) {
    function send<T>(msg: Message<T>) {
        ws.send(JSON.stringify(msg))
    }
    ws.on("message", async rawData => {
        if (typeof rawData !== "string") {
            send({
                type: "error",
                message: "only supporting string message",
            })
            ws.close()
            return
        }
        let data
        try {
            data = JSON.parse(rawData)
        } catch (e) {
            send({
                type: "error",
                message: "failed to parse your sent message (please use JSON!)",
            })
            ws.close()
            return
        }
        const type = data.type
        switch (type) {
            case "connect":
                const tokenString = data.token
                if (typeof tokenString != "string") {
                    send({
                        type: "error",
                        message: "your token is invalid",
                    })
                    ws.close()
                    return
                }

                const token = await getRepository(AccessToken).findOne({
                    token: tokenString,
                })
                if (token == null) {
                    send({
                        type: "error",
                        message: "authorization failed",
                    })
                    ws.close()
                }

                switch (data.stream) {
                    case "v1/timelines/public":
                        const redis = getRedisConnection()
                        redis.subscribe("timelines:public", async err => {
                            if (err != null) {
                                console.error(err)
                                send({
                                    type: "error",
                                    message: "server side redis error",
                                })
                                ws.close()
                            }
                        })
                        redis.on("message", async (channel, message) => {
                            const rawPost = await getRepository(Post).findOne(
                                {
                                    id: parseInt(message),
                                },
                                {
                                    relations: ["user", "application"],
                                }
                            )
                            if (rawPost == null) return
                            const post = await getCustomRepository(
                                PostRepository
                            ).pack(rawPost)
                            send({
                                type: "message",
                                content: post,
                            })
                        })
                        ws.addEventListener("close", () => {
                            redis.unsubscribe()
                            redis.end(true)
                        })
                        send({
                            type: "success",
                        })
                        break
                    default:
                        send({
                            type: "error",
                            message: "your selected stream is not found",
                        })
                        ws.close()
                }
                break
            case "ping":
                return
            default:
                send({
                    type: "error",
                    message: "unknown message",
                })
                ws.close()
                return
        }
    })
}
