import Redis from "redis"
import { REDIS_URL } from "../config"

export function getRedisConnection() {
    return Redis.createClient(REDIS_URL)
}

export const publishRedisConnection = getRedisConnection()
