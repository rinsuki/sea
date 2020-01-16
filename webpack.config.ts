import { Configuration } from "webpack"

const config: Configuration = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    entry: "./src/client/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist/client/assets",
        publicPath: "/assets",
    },
    module: {
        rules: [{ test: /\.tsx?$/, use: "ts-loader" }],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
}

export default config
