// @ts-check
const typeorm = require("typeorm")

/** @type {typeorm.ConnectionOptions} */
const config = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: ["dist/db/entities/*.js"],
    migrations: ["dist/db/migrations/*.js"],
    subscribers: ["dist/db/subscribers/*.js"],
    cli: {
        entitiesDir: "src/db/entities/",
        migrationsDir: "src/db/migrations/",
        subscribersDir: "src/db/subscribers/",
    },
}

module.exports = config
