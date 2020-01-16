// @ts-check
const typeorm = require("typeorm")

/** @type {typeorm.ConnectionOptions} */
const config = {
    type: "postgres",
    url: process.env.NODE_ENV === "test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL,
    entities: ["dist/server/db/entities/*.js"],
    migrations: ["dist/server/db/migrations/*.js"],
    subscribers: ["dist/server/db/subscribers/*.js"],
    cli: {
        entitiesDir: "src/server/db/entities/",
        migrationsDir: "src/server/db/migrations/",
        subscribersDir: "src/server/db/subscribers/",
    },
    ssl: process.env.DATABASE_SSL_ENABLED === "yes" ? true : false,
}

module.exports = config
