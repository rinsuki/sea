// @ts-check
const typeorm = require("typeorm")

/** @type {typeorm.ConnectionOptions} */
const config = {
    type: "postgres",
    url: process.env.NODE_ENV === "test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL,
    entities: ["dist/db/entities/*.js"],
    migrations: ["dist/db/migrations/*.js"],
    subscribers: ["dist/db/subscribers/*.js"],
    cli: {
        entitiesDir: "src/db/entities/",
        migrationsDir: "src/db/migrations/",
        subscribersDir: "src/db/subscribers/",
    },
    ssl: process.env.DATABASE_SSL_ENABLED === "yes" ? true : false,
}

module.exports = config
