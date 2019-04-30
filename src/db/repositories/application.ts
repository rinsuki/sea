import { EntityRepository, Repository } from "typeorm"
import { Application } from "../entities/application"

@EntityRepository(Application)
export class ApplicationRepository extends Repository<Application> {
    async pack(application: Application) {
        return (await this.packMany([application]))[0]
    }

    async packMany(applications: Application[]) {
        return applications.map(app => ({
            id: app.id,
            name: app.name,
        }))
    }
}
