import { UserSession } from "../../db/entities/userSession"
import React from "react"
import { Wrapper } from "../common/wrapper"

function InputInviteCodeNotify() {
    return (
        <strong>
            <a href="/input_invite_code">
                招待コードを入力するまでは、全ての機能が利用できません。ここをクリックすると招待コードの入力画面に推移します
            </a>
        </strong>
    )
}

export function Entrance({ session, threadNumber }: { session?: UserSession; threadNumber?: number }) {
    const inputInviteCodeRequired = session && session.user.inviteCode == null
    return (
        <Wrapper>
            <h1>Sea</h1>
            {inputInviteCodeRequired && <InputInviteCodeNotify />}
            <ul>
                {session ? (
                    <>
                        <li>
                            <a href="/applications">公開されてるアプリ一覧</a>
                        </li>
                        <li>
                            <a href="/explore">Explore</a>
                            <ul>
                                <li>
                                    <a href="/explore/ranking">ランキング</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="/settings">設定</a>
                        </li>
                        <li>
                            <a href="/logout">ログアウト</a>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <a href="/login">ログイン</a>
                        </li>
                        <li>
                            <a href="/register">登録</a>
                        </li>
                    </>
                )}
            </ul>
            {session && (
                <table
                    style={{
                        width: "95%",
                        backgroundColor: "#CFC",
                        marginLeft: "2.5%",
                        borderStyle: "outset",
                        borderWidth: 1,
                    }}
                    cellSpacing={7}
                    cellPadding={3}
                >
                    <tr>
                        <td style={{ borderStyle: "inset", borderWidth: 1 }}>
                            <small>
                                <a href="/posts/">1: 雑談スレ★n ({threadNumber})</a>
                            </small>
                        </td>
                    </tr>
                </table>
            )}
        </Wrapper>
    )
}
