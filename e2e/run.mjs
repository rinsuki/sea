// @ts-check

import { firefox } from "playwright-firefox"
import got from "got"

async function main() {
    const browser = await firefox.launch()
    const page = await browser.newPage()
    try {
        // register
        await page.goto("http://localhost:3000")
        await page.click(`a[href="/register"]`)
        await page.type(`input[name="name"]`, "admin")
        await page.type(`input[name="screen_name"]`, "admin")
        await page.type(`input[name="password"]`, "adminadmin")
        await page.click(`input[value="登録"]`)
        await page.click(`a[href="/input_invite_code"]`)
        await page.click(`input[value="送信"]`)
        // register app
        await page.click(`a[href="/settings"]`)
        await page.click(`a[href="/settings/my_developed_applications"]`)
        await page.click(`a[href="/settings/my_developed_applications/new"]`)
        await page.type(`input[name="name"]`, "e2etester")
        await page.type(`textarea[name="description"]`, "E2E Tester")
        await page.click(`input[value="アプリを作成"]`)
        // generate token
        await Promise.all([
            page.waitForEvent("dialog").then(dialog => {
                if (dialog.message() !== "アクセストークン発行モードに突入!!") throw `${dialog.message()}`
                return dialog.accept()
            }),
            page.click(`form[action$="/my_token"] input[type="submit"]`)
        ])
        const token = await page.$eval(`input#access_token`, (/** @type {HTMLInputElement} */ elm) => elm.value)
        // create post
        const post = await got.post("http://localhost:3000/api/v1/posts", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: "this is test"
            }),
            responseType: "json",
        })
        // see post
        await page.goto(`http://localhost:3000/posts/${post.body.id}`)
    } finally {
        await page.screenshot({
            path: "screenshot.png",
            type: "png",
            fullPage: true,
        })
    }
    await browser.close()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})