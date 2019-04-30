import Router from "koa-router"
import { AccessToken } from "../../db/entities/accessToken"

export type APIRouterState = {
    token: AccessToken
}

export class APIRouter extends Router<APIRouterState> {}
