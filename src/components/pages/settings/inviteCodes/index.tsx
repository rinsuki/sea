import React from "react"
import { Wrapper } from "../../../common/wrapper"
import { UserSession } from "../../../../db/entities/userSession"
import { InviteCode } from "../../../../db/entities/inviteCode"
import { User } from "../../../../db/entities/user"

export function Tree({ invites, root }: { invites: InviteCode[]; root: User }) {
    const myInvites = invites.filter(i => i.fromUser.id === root.id && i.fromUser.id !== i.toUser?.id)
    return (
        <>
            @{root.screenName}
            <ul>
                {myInvites.map(i => (
                    <li key={i.id}>
                        <Tree invites={invites} root={i.toUser!} />
                    </li>
                ))}
            </ul>
        </>
    )
}

export function InviteCodeIndex(props: { session: UserSession; invites: InviteCode[] }) {
    const rootInvites = props.invites.filter(i => i.fromUser.id === i.toUser?.id)
    return (
        <Wrapper>
            <h1>招待コード</h1>
            {props.session.user.canMakeInviteCode && <a href="/settings/invite_codes/new">作成</a>}
            <h2>招待ツリー</h2>
            <ul>
                {rootInvites.map(i => (
                    <li key={i.id}>
                        <Tree invites={props.invites} root={i.toUser!} />
                    </li>
                ))}
            </ul>
        </Wrapper>
    )
}
