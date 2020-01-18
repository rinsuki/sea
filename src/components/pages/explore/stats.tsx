import { Wrapper } from "../../common/wrapper"
import React from "react"

function ReadableInt(props: { value: number }) {
    return <>{props.value.toLocaleString("ja-JP")}</>
}

export function ExploreStats(props: {
    count: {
        users: number
        posts: number
        files: number
        bytes: number
    }
}) {
    return (
        <Wrapper>
            <h1>Stats</h1>
            <table>
                <tr>
                    <th>ユーザー数</th>
                    <td>
                        <ReadableInt value={props.count.users} />人 (招待を受け取り済みの範囲で)
                    </td>
                </tr>
                <tr>
                    <th>投稿数</th>
                    <td>
                        <ReadableInt value={props.count.posts} />
                        投稿
                    </td>
                </tr>
                <tr>
                    <th>ファイル数</th>
                    <td>
                        <ReadableInt value={props.count.files} />
                        ファイル (全員の合計、削除済みのものも含む)
                    </td>
                </tr>
                <tr>
                    <th>保存されているファイルの合計容量</th>
                    <td>
                        <ReadableInt value={props.count.bytes} />
                        バイト (全員の合計、サムネイル等の分及び削除済みのものも含む)
                    </td>
                </tr>
            </table>
        </Wrapper>
    )
}
