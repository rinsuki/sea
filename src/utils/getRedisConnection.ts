import Redis from "redis"
import { REDIS_URL } from "../config"

export function getRedisConnection() {
    if (process.env.NODE_ENV === "test") return require("redis-mock").createClient() as Redis.RedisClient
    return Redis.createClient(REDIS_URL)
}

export const publishRedisConnection = getRedisConnection()
