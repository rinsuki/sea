import React from "react"
import { Wrapper } from "../../../common/wrapper"
import { CustomEmoji } from "../../../../db/entities/customEmoji"
import { getPathFromHash } from "../../../../utils/getPathFromHash"
import { S3_PUBLIC_URL } from "../../../../config"

export function CustomEmojisIndex(props: { csrf: string; emojis: CustomEmoji[] }) {
    return (
        <Wrapper>
            <h1>カスタム絵文字</h1>
            <h2>登録</h2>
            <a href="/settings/custom_emojis/new">画像を登録</a>
            <a href="/settings/custom_emojis/new_alias">エイリアスを登録</a>
            <h2>リスト</h2>
            並び換え:
            <a href="?order=date">最近登録された順</a>
            <a href="?order=name">名前順</a>
            <a href="?order=uploader">登録者順</a>
            <table {...{ border: 1 }}>
                <tr>
                    <th>画像</th>
                    <th>shortcode</th>
                    <th>登録者</th>
                </tr>
                {props.emojis.map(emoji => (
                    <tr key={emoji.id}>
                        <td>
                            <img src={S3_PUBLIC_URL + getPathFromHash(emoji.hash)} style={{ height: "2em" }} />
                        </td>
                        <td>{emoji.shortcode}</td>
                        <td>@{emoji.user.screenName}</td>
                    </tr>
                ))}
            </table>
        </Wrapper>
    )
}
