import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import ServiceManager from "./abstract/ServiceManager";

export default class PrizeService extends BaseService<PrizeDao<Prize>, Prize> {
    constructor(app: ServiceManager) {
        super(new PrizeDao(app.context), app);
        return this.register(this);
    }

    async my(): Promise<Prize[]> {
        let filter = {
            "user.openId": this.openId,
            "user.activityId": this.activityId
        }
        return await this.getAll(filter);
    }

    /**
     * 领取奖品
     * @param prizeId
     * @param ext
     */
    async receive(prizeId: string, ext: any): Promise<number> {
        let filter = {
            _id: prizeId,
            "user.openId": this.openId
        }
        let options = {
            $set: {
                receiveTime: this.time().common,
                receiveStatus: true,
                ext
            }
        }
        return await this.edit(filter, options);
    }
}