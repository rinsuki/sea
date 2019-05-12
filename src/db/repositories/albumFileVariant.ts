import { EntityRepository, Repository } from "typeorm"
import { AlbumFileVariant } from "../entities/albumFileVariant"
import { S3_PUBLIC_URL } from "../../config"
import { EXT2MIME } from "../../constants"

@EntityRepository(AlbumFileVariant)
export class AlbumFileVariantRepository extends Repository<AlbumFileVariant> {
    async pack(variant: AlbumFileVariant) {
        return {
            id: variant.id,
            score: variant.score,
            extension: variant.extension,
            type: variant.type,
            size: variant.size,
            url: `${S3_PUBLIC_URL}${variant.toPath()}`,
            mime: EXT2MIME[variant.extension],
        }
    }

    async packMany(variants: AlbumFileVariant[]) {
        return await Promise.all(variants.map(v => this.pack(v)))
    }
}
