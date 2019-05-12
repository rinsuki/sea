import { EntityRepository, Repository, getCustomRepository } from "typeorm"
import { AlbumFile } from "../entities/albumFile"
import { AlbumFileVariantRepository } from "./albumFileVariant"

@EntityRepository(AlbumFile)
export class AlbumFileRepository extends Repository<AlbumFile> {
    async pack(file: AlbumFile) {
        return (await this.packMany([file]))[0]
    }

    async packMany(files: AlbumFile[]) {
        var allVariants = await getCustomRepository(AlbumFileVariantRepository).packMany(
            files
                .map(f =>
                    f.variants.map(v => {
                        v.albumFile = f
                        return v
                    })
                )
                .reduce((arr, now) => {
                    return arr.concat(...now)
                }, [])
        )
        return files.map(file => {
            const variantIds = file.variants.map(v => v.id)
            return {
                id: file.id,
                name: file.name,
                variants: allVariants
                    .filter(v => variantIds.includes(v.id))
                    .sort((a, b) => (a.score === b.score ? a.id - b.id : b.score - a.score))
                    .map(v => {
                        return v
                    }),
            }
        })
    }
}
