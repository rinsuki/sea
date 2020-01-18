import React from "react"
import { Wrapper } from "../../../common/wrapper"

export function CustomEmojisNew(props: { csrf: string }) {
    return (
        <Wrapper>
            <h1>カスタム絵文字を登録</h1>
            <form method="POST" encType="multipart/form-data">
                <input type="hidden" name="_csrf" value={props.csrf} />
                <dl>
                    <dt>shortcode</dt>
                    <dd>
                        :
                        <input
                            type="text"
                            name="shortcode"
                            required
                            maxLength={32}
                            pattern="^[A-Za-z0-9_]+$"
                            placeholder="^[A-Za-z0-9_]{1,32}$"
                        />
                        :
                    </dd>
                    <dt>画像</dt>
                    <dd>
                        <input type="file" name="file" accept="image/jpeg, image/png" />
                        <br />
                        pngかjpeg、256KB以内、縦横比1:2〜2:1、アニメーションは無視
                    </dd>
                </dl>
                <input type="submit" value="登録" />
            </form>
        </Wrapper>
    )
}
