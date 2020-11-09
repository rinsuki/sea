// @ts-check

import { firefox } from "playwright-firefox"

async function main() {
    const browser = await firefox.launch()
    // register
    const page = await browser.newPage()
    try {
        await page.goto("http://localhost:3000")
        await page.click(`a[href="/register"]`)
        await page.focus(`input[name="name"]`)
        await page.keyboard.type(`admin\tadmin\tadminadmin\t\n`)
        await page.click(`input[value="登録"]`)
        await page.click(`input[value="送信"]`)
    } catch(e) {
        await page.screenshot({
            path: "error.png",
            type: "png",
            fullPage: true,
        })
        throw e
    }
    await browser.close()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})