import { EntityRepository, Repository } from "typeorm"
import { Subscription } from "../entities/subscription"

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
                    description: subscription.description,
                    endpoint: subscription.endpoint,
                    failedAt: subscription.failedAt,
                    createdAt: subscription.createdAt,
                    updatedAt: subscription.updatedAt,
                }
            })
        )
    }
}
