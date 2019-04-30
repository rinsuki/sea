import Router from "koa-router"
import { AccessToken } from "../../db/entities/accessToken"
import { IPackableObject } from "../../interfaces/packable"
import { ObjectType } from "typeorm"

export type APIRouterState = {
    token: AccessToken
}

export type APIRouterCustom = {
    send<Input, Output>(
        repository: ObjectType<IPackableObject<Input, Output>>,
        input: Input
    ): Promise<void>
    sendMany<Input, Output>(
        repository: ObjectType<IPackableObject<Input, Output>>,
        inputs: Input[]
    ): Promise<void>
}

export class APIRouter extends Router<APIRouterState, APIRouterCustom> {}
