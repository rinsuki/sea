import { AccessToken } from "../db/entities/accessToken"
import { Repository } from "typeorm"

export interface IPackableObject<InputObj, OutputObj> extends Repository<InputObj> {
    pack(obj: InputObj, token: AccessToken): Promise<OutputObj>
    packMany(objects: InputObj[], token: AccessToken): Promise<OutputObj[]>
}
