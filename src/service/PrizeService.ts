import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import App from "../App";

export default class PrizeService extends BaseService<PrizeDao<Prize>, Prize> {
    constructor(app: App) {
        super(new PrizeDao(app.context), app);
        return this.register(this);
    }

    async my(): Promise<Prize[]> {
        let filter = {
            openId: this.openId,
            activityId: this.activityId
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
            openId: this.openId
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