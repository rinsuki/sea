import { EntityRepository, Repository, getCustomRepository, getRepository, In, Not, IsNull } from "typeorm"
import { AlbumFile } from "../entities/albumFile"
import { AlbumFileVariantRepository } from "./albumFileVariant"
import { AlbumFileVariant } from "../entities/albumFileVariant"

@EntityRepository(AlbumFile)
export class AlbumFileRepository extends Repository<AlbumFile> {
    async pack(file: AlbumFile) {
        return (await this.packMany([file]))[0]
    }

    async packMany(files: AlbumFile[]) {
        if (files.length === 0) return []
        const requireVariantsFiles = files.filter(f => f.variants == null)
        let variants = files
            .filter(f => f.variants != null)
            .flatMap(f =>
                f.variants.map(v => {
                    v.albumFile = f
                    return v
                })
            )
        if (requireVariantsFiles.length) {
            variants = variants.concat(
                (await getRepository(AlbumFileVariant).find({
                    albumFileId: In(requireVariantsFiles.map(f => f.id)),
                    deletedAt: IsNull(),
                })).map(v => {
                    v.albumFile = requireVariantsFiles.find(({ id }) => v.albumFileId === id)!
                    return v
                })
            )
        }
        const packedVariants = await getCustomRepository(AlbumFileVariantRepository).packMany(variants)
        return files.map(file => {
            const variantIds = variants.filter(v => v.albumFileId === file.id).map(v => v.id)
            return {
                id: file.id,
                name: file.name,
                type: file.type,
                variants: packedVariants
                    .filter(({ id }) => variantIds.includes(id))
                    .sort((a, b) => (a.score === b.score ? a.id - b.id : b.score - a.score)),
            }
        })
    }
}
