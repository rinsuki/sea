import React from "react"
import { Wrapper } from "../../../common/wrapper"
import { UserSession } from "../../../../db/entities/userSession"
import { InviteCode } from "../../../../db/entities/inviteCode"
import { User } from "../../../../db/entities/user"

export function Tree({ invites, root }: { invites: InviteCode[]; root?: User }) {
    const myInvites = invites.filter(i =>
        root ? i.fromUser.id === root.id && i.fromUser.id !== i.toUser?.id : i.fromUser.id === i.toUser?.id
    )
    return (
        <>
            {myInvites.map(i => (
                <li key={i.id}>
                    @{i.toUser?.screenName}
                    <ul>
                        <Tree invites={invites} root={i.toUser!} />
                    </ul>
                </li>
            ))}
        </>
    )
}

export function InviteCodeIndex(props: { session: UserSession; invites: InviteCode[] }) {
    return (
        <Wrapper>
            <h1>招待コード</h1>
            {props.session.user.canMakeInviteCode && <a href="/settings/invite_codes/new">作成</a>}
            <h2>招待ツリー</h2>
            <ul>
                <Tree invites={props.invites} />
            </ul>
        </Wrapper>
    )
}
