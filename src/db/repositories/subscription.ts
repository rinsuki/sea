import { EntityRepository, Repository, getCustomRepository } from "typeorm"
import { Subscription } from "../entities/subscription"
import { ApplicationRepository } from "./application"

@EntityRepository(Subscription)
export class SubscriptionRepository extends Repository<Subscription> {
    async pack(subscription: Subscription) {
        return (await this.packMany([subscription]))[0]
    }

    async packMany(subscriptions: Subscription[]) {
        return Promise.all(
            subscriptions.map(async subscription => {
                return {
                    id: subscription.id,
                    name: subscription.description,
                    endpoint: subscription.endpoint,
                    failedAt: subscription.failedAt,
                    application: await getCustomRepository(ApplicationRepository).pack(subscription.application),
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt,
                }
            })
        )
    }
}
