import { CustomEmoji } from "../entities/customEmoji"
import { Repository, EntityRepository } from "typeorm"
import { S3_PUBLIC_URL } from "../../config"
import { getPathFromHash } from "../../utils/getPathFromHash"

@EntityRepository(CustomEmoji)
export class CustomEmojiRepository extends Repository<CustomEmoji> {
    async pack(emoji: CustomEmoji) {
        return {
            id: emoji.id,
            shortcode: emoji.shortcode,
            size: {
                width: emoji.width,
                height: emoji.height,
            },
            url: `${S3_PUBLIC_URL}${getPathFromHash(emoji.hash)}`,
            isDeleted: emoji.deletedAt != null,
            createdAt: emoji.createdAt,
            updatedAt: emoji.updatedAt,
        }
    }

    async packMany(emojis: CustomEmoji[]) {
        return await Promise.all(emojis.map(e => this.pack(e)))
    }
}
