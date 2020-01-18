import React from "react"
import { Wrapper } from "../../../common/wrapper"
import { CustomEmoji } from "../../../../db/entities/customEmoji"
import { getPathFromHash } from "../../../../utils/getPathFromHash"
import { S3_PUBLIC_URL } from "../../../../config"

export function CustomEmojisIndex(props: { emojis: CustomEmoji[] }) {
    return (
        <Wrapper>
            <h1>カスタム絵文字</h1>
            <h2>登録</h2>
            <a href="/settings/custom_emojis/new">画像を登録</a>
            <a href="/settings/custom_emojis/new_alias">エイリアスを登録</a>
            <h2>リスト</h2>
            <table {...{ border: 1 }}>
                <tr>
                    <th>画像</th>
                    <th>
                        <a href="?order=name">shortcode</a>
                    </th>
                    <th>
                        <a href="?order=uploader">登録者</a>
                    </th>
                    <th>
                        <a href="?order=date">登録日時</a>
                    </th>
                </tr>
                {props.emojis.map(emoji => (
                    <tr key={emoji.id}>
                        <td>
                            <img src={S3_PUBLIC_URL + getPathFromHash(emoji.hash)} style={{ height: "2em" }} />
                        </td>
                        <td>{emoji.shortcode}</td>
                        <td>@{emoji.user.screenName}</td>
                        <td>{emoji.createdAt}</td>
                    </tr>
                ))}
            </table>
        </Wrapper>
    )
}
